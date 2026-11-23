# JIRA Requirement Analysis Report Template

Use this template to document the requirement analysis and testability review for any JIRA ticket, user story, or feature specification.

---

# Requirement Analysis Report: [<JIRA-KEY>] - <Ticket Title>

- **Review Date:** <YYYY-MM-DD>
- **Analyzed By:** <QA Engineer Name / Agent>
- **Ticket Type:** Story / Improvement / Bug / Epic
- **Component / Module:** <Module Name>
- **Fix Version / Target Release:** <Release / Sprint>
- **Author / Product Owner:** <Name>

---

## 1. Executive Verdict & Testability Score

| Verdict | 🟢 READY FOR TEST DESIGN | 🟡 CONDITIONALLY READY | 🔴 NOT READY (BLOCKED) |
|---|:---:|:---:|:---:|
| **Selected** | [ ] | [ ] | [ ] |

- **Blocker Count:** `<N>` critical gaps requiring PO resolution.
- **Testability Confidence:** `<Score % or High / Medium / Low>`
- **Executive Summary:** `<Brief summary of requirement health and readiness to test.>`

---

## 2. Requirement Checklist & Scoring

| Dimension | Criteria | Status (✅/⚠️/❌) | Observations & Evidence |
|---|---|:---:|---|
| **Clarity** | Acceptance criteria are written in unambiguous, measurable language | | |
| **Completeness** | All user paths, happy paths, and alternate paths are documented | | |
| **Negative Scenarios** | Invalid inputs, empty states, boundary values are defined | | |
| **Error Handling** | Exact error messages, toast/alert styles, and HTTP status codes defined | | |
| **Roles & Permissions** | Access control, RBAC roles, and forbidden actions specified | | |
| **Data Integrity** | Required vs optional fields, formats, max/min lengths, uniqueness | | |
| **Dependencies** | Downstream APIs, third-party services, webhooks, database impacts | | |
| **Non-Functional** | Performance SLA, security considerations, accessibility (WCAG) | | |
| **UI & UX Assets** | Figma / wireframes attached and consistent with written ACs | | |

---

## 3. Detailed Findings

### ❌ Gaps (Missing Requirements)
*Items completely omitted from the ticket that prevent full test coverage.*
- **GAP-01: [<Topic>]** `<Description of what is missing and why it blocks testing.>`
- **GAP-02: [<Topic>]** `<Description>`

### ⚠️ Ambiguities (Dual Interpretations)
*Phrasing that can be interpreted in more than one way by development and QA.*
- **AMB-01: [<Topic>]**
  - *Text in ticket:* `"<quote from ticket>"`
  - *Interpretation A:* `<How dev might implement it>`
  - *Interpretation B:* `<How QA or user might expect it>`
  - *Proposed resolution:* `<Suggested clear behavior>`

### 🚨 Technical & Business Risks
*Potential bugs, data leaks, race conditions, or regressions if implemented as-is.*
- **RSK-01 (Severity: High/Medium/Low):** `<Risk description and affected component>`

---

## 4. Actionable Questions for the Author / Product Owner

*Copy and paste these directly into JIRA comments:*

1. **[Scope/Flow]:** `<Direct, single-topic question>`
2. **[Validation]:** `<Question regarding input validation or error behavior>`
3. **[Permissions]:** `<Question regarding user roles or edge states>`
4. **[Edge Case]:** `<Question on timeout, concurrency, or data boundaries>`

---

## 5. Human Review Gate & Assumptions Log

> [!IMPORTANT]
> The QA Engineer must review and validate this report before sending questions to the author or proceeding to test case design.

### Assumptions Made:
1. `<Assumption 1 made during analysis>`
2. `<Assumption 2>`

### Sign-off:
- [ ] Findings reviewed by QA Engineer
- [ ] Questions submitted to Product Owner / Author in JIRA
- [ ] Requirements updated and ticket moved to Ready for QA / In Progress
