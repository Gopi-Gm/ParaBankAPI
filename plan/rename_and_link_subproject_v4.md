# Version 4 (v4.0): Subproject Renaming & Unified Root Integration

## 1. Overview & Objective
Version 4 resolved naming inconsistencies, modernized documentation, and unified the project workspace. The sub-project directory was renamed from `qa-test-case-generation` to `api-test-case-generation` to reflect its API-dedicated function, and root-level scripts were added to enable seamless execution across both packages.

---

## 2. User Prompts & Triggers
1. *"now readme files and Framework-Step-By-Step.md make the chages according to parabank"*
2. *"@[d:\ParaBank\qa-test-case-generation] rename this to api-test-case-generation"*
3. *"@[d:\ParaBank\api-test-case-generation] check this project and check para bank it should be link"*

---

## 3. Key Changes & Implementations

### A. Directory Renaming with Process Unlock
- **Challenge**: Standard PowerShell `Rename-Item` encountered Windows file-lock errors due to active IDE language servers / Node processes.
- **Solution**: Used Windows `robocopy` mirror migration followed by directory cleanup:
  - `qa-test-case-generation/` ➔ `api-test-case-generation/`

### B. Documentation Synchronization
- **`README.md` (Root)**:
  - Updated directory structure tree to show `api-test-case-generation`.
  - Added dedicated section explaining the dual-project architecture (Root Execution Engine + Subproject AI Agent Generation Suite).
- **`docs/Framework-Step-By-Step.md`**:
  - Replaced all legacy paths with `api-test-case-generation`.
  - Updated AI prompt templates to instruct AI agents on modern directory layout.
- **`api-test-case-generation/README.md` & `package.json`**:
  - Renamed package to `@parabank/api-test-case-generation`.
  - Updated references to input Swagger contracts and output artifacts.

### C. Workspace Linking & Unified Scripts
- Updated root `package.json` with convenience scripts:
  ```json
  "scripts": {
    "test:api": "npx playwright test",
    "test:generation": "npm --prefix api-test-case-generation test",
    "test:all": "npm run test:api && npm run test:generation"
  }
  ```
- Configured `api-test-case-generation/playwright.config.ts` with custom test directory and output reporters.

---

## 4. Verification & Outcome
- Executed linked runner from root workspace:
  ```bash
  npm run test:generation
  ```
- Verified that developers can trigger both test suites independently or simultaneously from the root repository.
