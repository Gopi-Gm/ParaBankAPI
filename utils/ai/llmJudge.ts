export interface EvalCriteria {
  name: string;
  description: string;
  minScore?: number; // Minimum acceptable score (1 to 5), default 4
}

export interface EvalResult {
  score: number;
  passed: boolean;
  reasoning: string;
  provider: string;
}

export class LLMJudge {
  /**
   * Evaluates AI output against a rubric.
   * If an API key is provided (AI_EVAL_API_KEY), it calls the evaluation model.
   * If not configured, it gracefully runs a deterministic heuristic fallback to ensure CI tests still execute safely.
   */
  static async evaluate(
    prompt: string,
    actualOutput: string,
    criteria: EvalCriteria,
    context?: string
  ): Promise<EvalResult> {
    const apiKey = process.env.AI_EVAL_API_KEY;
    const provider = process.env.AI_EVAL_PROVIDER || 'heuristic-fallback';
    const minScore = criteria.minScore ?? 4;

    // 1. If real evaluator API key is configured, invoke LLM Evaluator
    if (apiKey) {
      try {
        return await this.callLLMEvaluator(prompt, actualOutput, criteria, context, apiKey);
      } catch (error: any) {
        console.warn(`[LLMJudge] API call failed, falling back to heuristic: ${error.message}`);
      }
    }

    // 2. Fallback heuristic evaluation (Ideal for zero-cost local CI runs)
    return this.fallbackHeuristicEval(prompt, actualOutput, criteria, minScore);
  }

  private static async callLLMEvaluator(
    prompt: string,
    actualOutput: string,
    criteria: EvalCriteria,
    context: string | undefined,
    apiKey: string
  ): Promise<EvalResult> {
    const minScore = criteria.minScore ?? 4;
    const endpoint =
      process.env.AI_EVAL_ENDPOINT ||
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const systemPrompt = `You are an automated QA Evaluator.
Criteria Name: "${criteria.name}"
Criteria Description: "${criteria.description}"

Evaluate the model output strictly based on the criteria.
Score from 1 (terrible/fails completely) to 5 (excellent/meets all requirements).
Respond ONLY with a JSON object in this exact shape:
{
  "score": <number between 1 and 5>,
  "reasoning": "<concise explanation of score>"
}`;

    const userMessage = `
Input Prompt: ${prompt}
${context ? `Reference Context: ${context}` : ''}
Model Output: ${actualOutput}
`;

    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Eval API returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.candidates[0].content.parts[0].text);

    return {
      score: parsed.score,
      passed: parsed.score >= minScore,
      reasoning: parsed.reasoning,
      provider: 'gemini-1.5-flash',
    };
  }

  private static fallbackHeuristicEval(
    prompt: string,
    actualOutput: string,
    criteria: EvalCriteria,
    minScore: number
  ): EvalResult {
    // Basic heuristics: non-empty, reasonably sized, no error signatures
    let score = 5;
    const reasons: string[] = [];

    if (!actualOutput || actualOutput.trim().length === 0) {
      return { score: 1, passed: false, reasoning: 'Output is empty', provider: 'heuristic-local' };
    }

    if (actualOutput.length < 30) {
      score -= 2;
      reasons.push('Output is overly brief');
    }

    if (/undefined|null|\[object Object\]|NaN/i.test(actualOutput)) {
      score -= 3;
      reasons.push('Output contains javascript artifact placeholders');
    }

    const passed = score >= minScore;
    return {
      score,
      passed,
      reasoning: reasons.length > 0 ? reasons.join('; ') : `Met baseline criteria: ${criteria.name}`,
      provider: 'heuristic-local',
    };
  }
}
