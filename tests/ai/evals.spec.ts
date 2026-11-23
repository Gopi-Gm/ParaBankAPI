import { test, expect } from '../../fixtures/aiFixture';
import { LLMJudge, EvalCriteria } from '../../utils/ai/llmJudge';

test.describe('LLM Evaluations (Evals) @ai @evals', () => {
  test('Evaluates customer account summary against professional banking tone', async () => {
    const inputPrompt = 'Summarize my current account standing and recent transactions.';
    const actualAiOutput =
      'Hello John! Your current checking account balance is $5,120.50. You have 3 recent transactions cleared, including a deposit of $1,200.00 on Friday. Everything is in good standing.';

    const criteria: EvalCriteria = {
      name: 'Professional Banking Tone & Clarity',
      description: 'Response must be polite, accurate, concise, and clearly state balance and recent status.',
      minScore: 4,
    };

    const evalResult = await LLMJudge.evaluate(inputPrompt, actualAiOutput, criteria);

    expect(
      evalResult.passed,
      `Evaluation failed with score ${evalResult.score}/5 (${evalResult.provider}): ${evalResult.reasoning}`
    ).toBe(true);
  });

  test('Catches low quality response failing brevity and completeness rubric', async () => {
    const inputPrompt = 'How do I transfer funds between my accounts?';
    const poorOutput = 'Just click transfer.'; // Too brief, lacks actionable steps

    const criteria: EvalCriteria = {
      name: 'Completeness and Actionability',
      description: 'Must provide clear, step-by-step navigation for transferring funds between accounts.',
      minScore: 4,
    };

    const evalResult = await LLMJudge.evaluate(inputPrompt, poorOutput, criteria);

    // Assert that the eval score flags the insufficient answer
    expect(evalResult.score).toBeLessThan(4);
  });
});
