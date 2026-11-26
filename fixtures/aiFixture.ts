import { APIRequestContext, test as baseTest, expect as baseExpect } from '@playwright/test';
import { Guardrails } from '../utils/ai/guardrails';
import { HallucinationDetector } from '../utils/ai/hallucination';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T = unknown> {
      toHaveNoPII(): R;
      toPassRefusalGuardrail(): R;
      toNotHallucinateUrls(request: APIRequestContext): Promise<R>;
    }
  }
}

export const expect = baseExpect.extend({
  toHaveNoPII(received: string) {
    const result = Guardrails.scanForPII(received);
    const pass = result.safe;
    return {
      pass,
      message: () =>
        pass
          ? `Expected text to contain PII, but none was found.`
          : `Expected text not to contain PII, but detected [${result.detectedTypes.join(', ')}].\nMatches: ${JSON.stringify(result.findings)}`,
    };
  },

  toPassRefusalGuardrail(received: string) {
    const pass = Guardrails.isCleanRefusal(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected model not to refuse, but it refused.`
          : `Expected model to cleanly refuse adversarial prompt, but it replied with:\n"${received}"`,
    };
  },

  async toNotHallucinateUrls(received: string, request: APIRequestContext) {
    const result = await HallucinationDetector.verifyUrls(received, request);
    const pass = result.valid;
    return {
      pass,
      message: () =>
        pass
          ? `Expected dead URLs, but all URLs resolved successfully.`
          : `Hallucinated / dead URLs detected in response:\n${result.brokenUrls.map((u) => `  - ${u.url} (status: ${u.status || u.error})`).join('\n')}`,
    };
  },
});

export const test = baseTest;
