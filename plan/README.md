# 📋 ParaBank Automation Framework — Version Evolution & Implementation Plans

This directory documents the chronological history, requirements, architecture decisions, and file changes implemented across the lifecycle of the **ParaBank REST API Automation Framework**.

---

## 🗺️ Version History Roadmap

| Version | Plan Document | Scope & Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **v1.0** | [added tests for parabankv1.md](file:///d:/ParaBank/plan/added%20tests%20for%20parabankv1.md) | Initial Swagger API Analysis & Test Generation | • Analyzed 8 Swagger services<br>• Created `ParaBank_REST_API_Test_Cases.md`<br>• Automated 23 tests in `parabank.spec.ts` |
| **v2.0** | [remove_dbv2.md](file:///d:/ParaBank/plan/remove_dbv2.md) | Scope Refinement: Purging UI & Direct DB Tests | • Removed `ui-test-creator-skill` & UI tests<br>• Removed `database.spec.ts` & `db_test_prompt.md`<br>• Dedicated framework strictly to REST API |
| **v3.0** | [api_framework_modularization_v3.md](file:///d:/ParaBank/plan/api_framework_modularization_v3.md) | Enterprise Modular Architecture (Playwright + TypeScript) | • Centralized routing (`routes.ts`)<br>• AJV Schema validation (`api/schemas/`)<br>• Rate-limit guard fixture (`apiFixture.ts`)<br>• 9 modular microservice test specs |
| **v4.0** | [rename_and_link_subproject_v4.md](file:///d:/ParaBank/plan/rename_and_link_subproject_v4.md) | Subproject Renaming & Workspace Integration | • Renamed `qa-test-case-generation` ➔ `api-test-case-generation`<br>• Linked npm scripts (`test:generation`) in root `package.json`<br>• Updated root `README.md` & `Framework-Step-By-Step.md` |
| **v5.0** | [architecture_workflow_and_db_analysis_v5.md](file:///d:/ParaBank/plan/architecture_workflow_and_db_analysis_v5.md) | Workflow Documentation & DB Feasibility Study | • Created end-to-end `apiworkflow.md`<br>• Investigated `db.htm`/`admin.htm` HSQLDB architecture<br>• Defined REST state validation strategy |
| **v6.0** | [ai_evals_hallucination_guardrails_v6.md](file:///d:/ParaBank/plan/ai_evals_hallucination_guardrails_v6.md) | GenAI Testing Layer (Evals, Hallucination, Guardrails) | • Created `utils/ai/` (Guardrails, Hallucination, LLMJudge)<br>• Custom Playwright matchers (`aiFixture.ts`)<br>• 13 automated tests (`tests/ai/`)<br>• Added `test:ai`, `test:guardrails`, `test:evals` |
| **v7.0** | [api_collection_and_chaining_v7.md](file:///d:/ParaBank/plan/api_collection_and_chaining_v7.md) | Postman Collection, Environment Variables & API Chaining | • Dedicated `postman-collection/` directory<br>• Postman collection v2.1.0 (`ParaBank_API_Collection.json`)<br>• QA Environment (`ParaBank.postman_environment.json`)<br>• 19-step End-to-End API Chaining with `pm.environment.set`<br>• Complete manual testing documentation |

---

## 📂 Quick Links to Files

- [v1.0: Added Tests for ParaBank (Initial Suite)](file:///d:/ParaBank/plan/added%20tests%20for%20parabankv1.md)
- [v2.0: Remove DB & UI Modules](file:///d:/ParaBank/plan/remove_dbv2.md)
- [v3.0: API Framework Modularization](file:///d:/ParaBank/plan/api_framework_modularization_v3.md)
- [v4.0: Rename & Link Subproject](file:///d:/ParaBank/plan/rename_and_link_subproject_v4.md)
- [v5.0: Architecture Workflow & DB Analysis](file:///d:/ParaBank/plan/architecture_workflow_and_db_analysis_v5.md)
- [v6.0: GenAI Evals, Hallucination Detection & Guardrails](file:///d:/ParaBank/plan/ai_evals_hallucination_guardrails_v6.md)
- [v7.0: Postman API Collection, Environment Variables & Chaining](file:///d:/ParaBank/plan/api_collection_and_chaining_v7.md)
