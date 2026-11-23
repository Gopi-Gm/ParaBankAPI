# RCA Triage Checklist

Use this checklist before writing a root cause. A failure is not analyzed until the intake, reproduction, and evidence gates are complete.

## 1. Intake Gate

- [ ] Test ID, title, spec path, and failing line captured.
- [ ] Layer identified from the failing assertion (`UI`, `API`, `DB`).
- [ ] Error message and stack trace captured verbatim.
- [ ] Expected vs actual behavior recorded separately.
- [ ] Environment, base URL, browser, build/commit, and worker count recorded.
- [ ] Retry count and retry outcome recorded.
- [ ] Recent changes (commits, config, data migrations) captured if available.

## 2. Reproduce or Isolate

- [ ] Re-run the single test in isolation.
- [ ] Re-run with `--last-failed` and note whether it still fails.
- [ ] Compare headed vs headless and single vs parallel worker.
- [ ] Confirm the test uses the intended user, fixture, and environment.
- [ ] Mark the failure `reproducible`, `intermittent`, or `unreproducible`.
- [ ] If unreproducible, do not invent a cause — report `Insufficient evidence` and list collection steps.

## 3. Evidence Gate

- [ ] Trace, screenshot, or video attached for UI failures.
- [ ] Console and network capture attached.
- [ ] Request and response bodies captured for API failures.
- [ ] SQL statement, bound parameters, and SQLSTATE captured for DB failures.
- [ ] Every missing artifact is listed explicitly.
- [ ] Logs are redacted for tokens, cookies, account numbers, and PII.

## 4. Classification Decision Tree

Ask in order; stop at the first match with supporting evidence:

1. **Tooling/config** — Does the test runner, reporter, auth storage, or CI config fail before the application is exercised?
2. **Environment** — Is the target unreachable, wrongly configured, stale, or missing a deployment/migration?
3. **Test data** — Is the fixture missing, shared, stale, colliding, or in the wrong state?
4. **Test defect** — Is the selector, assertion, mock, step, or expectation wrong?
5. **Requirement gap** — Is the expected behavior undefined or contradictory?
6. **Flaky/timing** — Does it pass on retry or isolation, or is there a race/animation/async wait?
7. **Product defect** — Does the application deviate from the requirement while the test and data are correct?

## 5. Hypothesis Discipline

- [ ] At least three hypotheses generated.
- [ ] Includes at least one "test defect" and one "environment/data" hypothesis.
- [ ] Each hypothesis states what evidence would confirm it.
- [ ] Each rejected hypothesis has a recorded reason.
- [ ] Correlation vs causation checked using timestamps/trace ordering.
- [ ] Symptom and cause are not conflated (a 500 after a UI failure may be downstream).

## 6. Conclusion Gate

- [ ] Root cause is one specific, falsifiable sentence.
- [ ] Classification assigned from the decision tree.
- [ ] Confidence assigned using the evidence standard.
- [ ] Every claim cites an artifact, status code, SQLSTATE, selector, or stack frame.
- [ ] Recommended fix names an owner and the smallest correct change.
- [ ] Verification step fails before the fix and passes after it.
- [ ] Prevention gap recorded.

## 7. Common Anti-Patterns

| Anti-Pattern | Why It Is Wrong | Do Instead |
|---|---|---|
| "The test is flaky, just retry it" | Masks a real race or data issue and hides the defect. | Prove flakiness with isolation/retry evidence, then fix the cause. |
| "API returned 500, so the API is broken" | The 500 may be caused by bad input, a downstream DB error, or an expired token. | Trace the request to the first failing component. |
| "Selector not found, so the app is broken" | The selector may be wrong, strict-mode ambiguous, or rendered later. | Inspect the DOM/trace and confirm the expected element exists. |
| "Expected value is wrong, so the product is wrong" | The requirement may be missing or the test may encode an assumption. | Classify as requirement gap or test defect unless the requirement is explicit. |
| "It passed locally, so CI is broken" | Environment, data, or timing differences are common. | Compare environment, seed data, and worker settings. |
| "Root cause: assertion failed" | That is the symptom, not the cause. | Explain the mechanism that produced the failure. |

## 8. Evidence Quality Rubric

| Level | Evidence Available | Allowed Confidence |
|---|---|---|
| **A** | Deterministic reproduction + trace/HTTP/SQL artifact at the failure point | High |
| **B** | Reproduction + one indirect artifact (console, log, screenshot) | Medium–High |
| **C** | No reproduction, but consistent artifacts across runs | Medium |
| **D** | Error message only | Low — hypothesis only |
| **E** | No error details | Insufficient evidence — stop and collect |
