import { APIRequestContext } from '@playwright/test';

export interface UrlCheckResult {
  valid: boolean;
  testedUrls: string[];
  brokenUrls: Array<{ url: string; status?: number; error?: string }>;
}

export interface GroundingCheckResult {
  grounded: boolean;
  score: number; // 0.0 to 1.0
  unsupportedClaims: string[];
}

export class HallucinationDetector {
  /**
   * Extracts all URLs from generated markdown/text and pings them via Playwright APIRequestContext.
   * Fails if any URL returns 4xx, 5xx, or fails network resolution.
   */
  static async verifyUrls(text: string, request: APIRequestContext): Promise<UrlCheckResult> {
    const rawRegex = /https?:\/\/[^\s\)\],"><]+/g;
    const rawUrls = text.match(rawRegex) || [];
    // Clean trailing punctuation like . , ; : !
    const urls = Array.from(new Set(rawUrls.map((u) => u.replace(/[.,;:!]+$/, ''))));
    const brokenUrls: Array<{ url: string; status?: number; error?: string }> = [];

    for (const url of urls) {
      try {
        const response = await request.fetch(url, {
          method: 'HEAD',
          timeout: 5000,
          failOnStatusCode: false,
        });

        // Some servers reject HEAD, fallback to GET if 405
        let status = response.status();
        if (status === 405) {
          const getRes = await request.get(url, { timeout: 5000, failOnStatusCode: false });
          status = getRes.status();
        }

        if (status >= 400) {
          brokenUrls.push({ url, status });
        }
      } catch (err: any) {
        brokenUrls.push({ url, error: err.message || 'Network error' });
      }
    }

    return {
      valid: brokenUrls.length === 0,
      testedUrls: urls,
      brokenUrls,
    };
  }

  /**
   * Checks whether IDs/Entities mentioned in AI response actually exist in reference dataset.
   */
  static verifyEntityExistence<T>(
    extractedEntities: T[],
    knownValidEntities: T[]
  ): { valid: boolean; hallucinatedEntities: T[] } {
    const knownSet = new Set(knownValidEntities);
    const hallucinatedEntities = extractedEntities.filter((entity) => !knownSet.has(entity));
    return {
      valid: hallucinatedEntities.length === 0,
      hallucinatedEntities,
    };
  }

  /**
   * Deterministic / N-gram heuristic for RAG grounding:
   * Checks whether key phrases or facts in the output have corresponding support in source context.
   */
  static checkHeuristicFaithfulness(output: string, referenceContext: string): GroundingCheckResult {
    // Break output into sentences
    const sentences = output
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    if (sentences.length === 0) {
      return { grounded: true, score: 1.0, unsupportedClaims: [] };
    }

    const unsupportedClaims: string[] = [];
    const normalizedContext = referenceContext.toLowerCase();

    for (const sentence of sentences) {
      // Extract significant keywords (exclude trivial stopwords)
      const words = sentence
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 4);

      if (words.length === 0) continue;

      const matchedWords = words.filter((w) => normalizedContext.includes(w));
      const overlapRatio = matchedWords.length / words.length;

      // If less than 40% of substantive words appear anywhere in context, mark as ungrounded claim
      if (overlapRatio < 0.4) {
        unsupportedClaims.push(sentence);
      }
    }

    const supportedCount = sentences.length - unsupportedClaims.length;
    const score = sentences.length > 0 ? supportedCount / sentences.length : 1.0;

    return {
      grounded: unsupportedClaims.length === 0,
      score: Number(score.toFixed(2)),
      unsupportedClaims,
    };
  }
}
