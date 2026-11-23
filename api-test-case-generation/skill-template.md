---
name: "qa-skill-template"
description: "A standardized template for creating new AI QA Agent skills following the RICE-POT prompt engineering framework."
version: "1.0.0"
author: "Gopi Mohan"
tags:
  - qa-engineering
  - prompt-engineering
  - rice-pot
testingTypes:
  - functional
  - non-functional
frameworks:
  - playwright
languages:
  - typescript
  - python
domains:
  - web
  - api
  - mobile
agents:
  - claude-code
  - cursor
  - github-copilot
  - antigravity
---

# [Skill Name]

Brief 1-2 sentence overview of what this QA skill accomplishes and which STLC phase it supports.

---

## Role (R)
Define the agent's persona, seniority, domain expertise, and perspective.
*Example: You are a Lead QA Engineer with 15+ years of experience in test design, automation architectures, and compliance standards.*

## Instructions (I)
Step-by-step sequential workflow the agent must execute. Be explicit, numbered, and comprehensive.
1. **Intake & Review:** Gather input requirements, specs, or code.
2. **Analysis & Strategy:** Apply testing methodologies (e.g., ECP, BVA, State Transition).
3. **Execution / Generation:** Formulate the test plan, test cases, automated specs, or defect report.
4. **Verification & Guardrails:** Check against edge cases, safety constraints, and deduplication rules.

## Context (C)
What materials the agent already has access to in this directory or environment.
- Templates: Reference `template.md` in this directory.
- Checklists: Reference any checklists in `references/`.
- Examples: Reference reference outputs in `examples/`.

## Example (E)
Provide a concrete input/output pair or link to an example file in `examples/`.
*Example: See `examples/sample-output.md` for a complete reference model run.*

## Parameters & Rules (P)
Strict boundaries, constraints, standards, and guardrails:
- **Never Assume:** Document missing info as TBD/Open Questions rather than hallucinating.
- **Deduplication:** Avoid redundant or duplicate test conditions.
- **Safety:** Never disclose live passwords, tokens, or PII.

## Output (O)
Exact shape, layout, table structure, or file formats required.
- Markdown table / document format.
- File export paths (e.g., saved to `output/` as `.md`, `.pdf`, `.docx`, or `.spec.ts`).

## Tone (T)
Voice and style guidelines:
- Objective, professional, technical, unambiguous, and production-ready.

---

## When to Use (Triggers)
List exact phrases and user intents that should trigger this skill:
- "trigger phrase 1"
- "trigger phrase 2"
- "when user asks for..."
