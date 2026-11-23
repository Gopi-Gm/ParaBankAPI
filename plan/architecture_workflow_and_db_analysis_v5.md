# Version 5 (v5.0): Architecture Workflow Documentation & Database Feasibility Study

## 1. Overview & Objective
In Version 5, end-to-end architectural and STLC workflow documentation was established via `apiworkflow.md`. Concurrently, a technical feasibility investigation was performed on ParaBank's database management interfaces (`db.htm` and `admin.htm`) to determine support for automated database testing.

---

## 2. User Prompts & Triggers
1. *"check this project how its works"*
2. *"check this project and explain how its works"*
3. *"create apiworkflow.md add above details"*
4. *"im using this website for testing, in the can i do db testing also?https://parabank.parasoft.com/parabank/db.htm"*

---

## 3. Technical Findings & Deliverables

### A. Comprehensive Architecture Guide (`apiworkflow.md`)
Created `d:\ParaBank\apiworkflow.md` documenting:
1. **Core Automation Engine Workflow**:
   - Environment setup (`.env`)
   - Configuration (`playwright.config.ts` with single-worker and 800ms delay)
   - Fixture injection (`apiFixture.ts`)
   - Route mapping (`routes.ts`)
   - AJV Contract Schema Validation
   - Custom reporting and Allure attachments
2. **QA Agent Skills Suite (`api-test-case-generation`)**:
   - Skill 01: `jira-requirement-analyzer-skill` (Epics & Acceptance Criteria extraction)
   - Skill 02: `testplan-creator-skill` (Scope, test matrix, risks)
   - Skill 03: `api-test-creator-skill` (Automated spec generation)
   - Skill 04: `rca-analyzer-skill` (Automated failure root cause analysis)
3. **Microservices Coverage Breakdown**: Mapping of all 8 ParaBank services and corresponding test suites.
4. **CI/CD Integration**: Jenkins & GitHub Actions workflow designs.

### B. ParaBank Database Testing Feasibility Analysis (`db.htm` / `admin.htm`)
- **Investigation**: Analyzed `https://parabank.parasoft.com/parabank/db.htm` and `https://parabank.parasoft.com/parabank/admin.htm`.
- **Backend Architecture Findings**:
  - The live ParaBank instance runs an in-memory **HSQLDB** (HyperSQL Database) embedded within the Tomcat application container.
  - The database is volatile and reloads from in-memory scripts when reset.
  - Direct database listening ports (e.g. 9001 for HSQL or 3306 for MySQL) are firewalled and inaccessible to external test runners.
- **Supported Testing Capabilities**:
  - **State Reset / Clean**:
    - `POST /parabank/services/bank/initializeDB`: Seeds demo customer accounts.
    - `POST /parabank/services/bank/cleanDB`: Clears ephemeral transactions.
  - **Data Access**: Data must be queried and asserted via REST endpoints (`/customers/{id}`, `/accounts/{id}/transactions`) rather than raw SQL `SELECT` queries.
- **Architectural Conclusion**:
  - Direct JDBC/SQL automation is neither supported nor practical on the public demo instance.
  - The recommended pattern is **API-driven State Validation**: Seed state using `initializeDB`, execute business operations, and assert state changes through the REST API.
