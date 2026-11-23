# Version 6 (v6.0): GenAI Testing Implementation — Evals, Hallucination Detection & Guardrails

## 1. Overview & Objective
In Version 6 (v6.0), the framework expanded from traditional deterministic REST API testing into modern **GenAI & LLM automation testing**. 

Deterministic assertions (`expect(res.body.text).toBe("Expected")`) fail when validating non-deterministic, probabilistic AI outputs (such as AI-driven banking chatbots, statement explainers, loan advisory assistants, and RAG search pipelines). Version 6 introduces a native, three-pillar AI quality assurance layer directly into the Playwright + TypeScript framework without requiring third-party testing daemons.

---

## 2. Core Pillars Implemented

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                 Playwright Test Runner                   │
                               │                    (@playwright/test)                    │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                                                            ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                        aiFixture                         │
                               │  • toHaveNoPII()                                         │
                               │  • toPassRefusalGuardrail()                              │
                               │  • toNotHallucinateUrls(request)                         │
                               └────────────┬───────────────────────────────┬─────────────┘
                                            │                               │
                     ┌──────────────────────┴───────┐       ┌───────────────┴──────────────────────┐
                     ▼                              ▼       ▼                                      ▼
         ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────────────┐
         │      Guardrails      │       │    Hallucination     │       │       LLM-as-a-Judge         │
         │ (utils/ai/guardrails)│       │(utils/ai/hallucinate)│       │     (utils/ai/llmJudge)      │
         └───────────┬──────────┘       └───────────┬──────────┘       └──────────────┬───────────────┘
                     │                              │                                 │
                     ▼                              ▼                                 ▼
         • PII Leakage Defense          • Live URL Ping (404/5xx)      • Qualitative Rubric Scoring   
         • Injection Deflection         • Entity/ID Grounding          • Score Thresholds (1-5)       
         • AJV Schema Guardrails        • RAG Faithfulness Scoring     • Gemini/OpenAI + Heuristic CI 
```

### Pillar 1: Guardrails Engine (`utils/ai/guardrails.ts`)
1. **PII Leakage Prevention**:
   - Automated regex scanner detecting unmasked SSNs (`\d{3}-\d{2}-\d{4}`), credit cards (`(?:\d{4}[ -]?){3}\d{4}`), Bearer tokens, API keys, and email addresses.
2. **Prompt Injection & Jailbreak Deflection**:
   - Automated verification that the model safely deflects adversarial attacks (e.g., DAN prompts, system override directives, database credential dump requests) using clean refusal signals.
3. **Structured Output Guardrail (AJV)**:
   - Validates that model-generated JSON strictly adheres to banking schemas (e.g., loan recommendations, bill payment payloads) and rejects unauthorized extra keys or invalid types.

### Pillar 2: Hallucination Detection Engine (`utils/ai/hallucination.ts`)
1. **Automated URL Verification**:
   - Extracts all hyperlinks from generated markdown or text using regex.
   - Pings every URL dynamically via Playwright’s `APIRequestContext` (`request.fetch` with `HEAD`/`GET`) to guarantee no `404 Not Found` or dead endpoints are presented to users.
2. **Entity Grounding**:
   - Cross-references model-generated IDs (Account IDs, Customer IDs, Transaction IDs) against known database records to catch fabricated entities.
3. **RAG Faithfulness & Context Grounding**:
   - Implements a heuristic n-gram overlap evaluator that inspects generated claims against reference context chunks, flagging unsupported claims that contradict or hallucinate beyond provided sources.

### Pillar 3: Evaluations (Evals) & LLM-as-a-Judge (`utils/ai/llmJudge.ts`)
1. **Programmatic Rubric Scoring**:
   - Evaluates AI outputs against configurable qualitative dimensions (*Tone*, *Clarity*, *Completeness*, *Accuracy*) on a 1–5 scale.
2. **Dual-Mode Execution**:
   - **Cloud Mode**: Connects to fast evaluator models (Gemini 1.5 Flash / GPT-4o-mini) via `AI_EVAL_API_KEY`.
   - **Local Heuristic CI Mode**: Zero-cost, deterministic fallback that checks artifact placeholders, output brevity, and baseline quality so pipelines pass reliably in restricted or offline CI environments.

---

## 3. Playwright Custom Matchers (`fixtures/aiFixture.ts`)

Playwright's `expect` was extended with typed, custom asynchronous and synchronous matchers:

```typescript
// 1. Assert response is free from PII
expect(responseBody).toHaveNoPII();

// 2. Assert model refused a malicious jailbreak prompt
expect(responseBody).toPassRefusalGuardrail();

// 3. Assert all generated URLs resolve without 4xx/5xx errors
await expect(responseBody).toNotHallucinateUrls(request);
```

---

## 4. Test Suites Added (`tests/ai/`)

| Test File | Tests | Focus Areas |
| :--- | :---: | :--- |
| `tests/ai/guardrails.spec.ts` | 7 | Adversarial prompt injection defense, SSN/Credit Card PII detection, AJV JSON schema enforcement. |
| `tests/ai/hallucination.spec.ts` | 4 | Dead link detection (`index.htm` vs 404s), Account ID entity validation, RAG faithfulness evaluation. |
| `tests/ai/evals.spec.ts` | 2 | Professional banking tone rubric scoring (score $\ge 4/5$), and low-quality/brief response flagging. |
| **Total** | **13** | **All 13 passed in 19.8s.** |

---

## 5. NPM Scripts & Execution

The following scripts were registered in `package.json`:

```bash
# Run all AI tests (Evals + Hallucination + Guardrails)
npm run test:ai

# Run only Guardrail & Security tests
npm run test:guardrails

# Run only Hallucination & Faithfulness tests
npm run test:hallucination

# Run only LLM Rubric Evals
npm run test:evals
```

---

## 6. Configuration Additions

In `.env.example` and `.env`:
```ini
### 🤖 GENAI EVALS & GUARDRAILS CONFIGURATION ###
AI_EVAL_PROVIDER=heuristic-fallback
AI_EVAL_API_KEY=
AI_EVAL_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

In `tsconfig.json`:
- Broadened compiler inclusions to ensure strict type checking across `fixtures/**/*`, `utils/**/*`, `tests/**/*`, and `api/**/*`.
