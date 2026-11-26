# 🛠️ Utility Files – Prompts (ParaBank REST API)

**Target folder:** `utils/`

## 📋 Common Requirements

For every prompt below:

- Create the file in the existing `utils/` folder using TypeScript.
- Use only the existing dependencies already present in `package.json` (`@faker-js/faker`, `dotenv`, `csv-parse`, `xlsx`, `playwright`).
- Do not add any other methods, classes, interfaces, types, constants, dependencies, validation, logging, or functionality beyond what the prompt specifies.
- Do not change the class names, method names, parameter names, return structures, values, or behavior specified below.
- Use clean, beginner-friendly TypeScript suitable for a Playwright automation framework.
- Return only the complete code for the requested file.

---

# 1. Create `helper.ts`

## Prompt

Create or update a file named `helper.ts` in the existing folder `utils`.

Create and export a class named `Helper` with exactly these static methods:

### 1.1 `convertPriceToNumber(price: string): number`
- Remove all characters from the input except digits and the decimal point (e.g. `"$200.50"` ➔ `200.50`).
- Convert the resulting value to a number.
- Return the number.

### 1.2 `getLoginDetails()`
Return exactly this object structure using environment variable fallbacks:
- `username`: `process.env.PARABANK_USERNAME || 'john'`
- `password`: `process.env.PARABANK_PASSWORD || 'demo'`

### 1.3 `getCustomerDetails()`
Return baseline customer identification data:
- `customerId`: `Number(process.env.CUSTOMER_ID) || 12212`
- `firstName`: `'John'`
- `lastName`: `'Smith'`

### 1.4 `getAccountDetails()`
Return baseline account identification data:
- `primaryAccountId`: `Number(process.env.PRIMARY_ACCOUNT_ID) || 12345`
- `secondaryAccountId`: `Number(process.env.SECONDARY_ACCOUNT_ID) || 12456`

## Expected Result
A `utils/helper.ts` file exporting the `Helper` class with static methods used for monetary balance conversion and baseline ParaBank test credentials.

---

# 2. Create `dataGenerator.ts`

## Prompt

Create or update a file named `dataGenerator.ts` in the existing folder `utils`.

Use the `@faker-js/faker` library (`import { faker } from '@faker-js/faker'`).

Create and export a class named `RandomDataUtil`.

### 2.1 Person & Identity
Implement static methods:
- `getFirstName(): string`
- `getLastName(): string`
- `getFullName(): string`
- `getEmail(): string`
- `getPhoneNumber(): string`
- `getUsername(): string`
- `getPassword(length: number = 10): string`
- `getSSN(): string` (format `###-##-####`)

### 2.2 Address & Location
Implement static methods:
- `getCountry(): string`
- `getState(): string`
- `getCity(): string`
- `getStreet(): string`
- `getStreetAddress(): string`
- `getZipCode(): string`
- `getLatitude(): string`
- `getLongitude(): string`

### 2.3 Date & Time
Implement static methods:
- `getCurrentDate(): string` (ISO `YYYY-MM-DD`)
- `getRecentDate(days: number = 10): string`
- `getFutureDate(years: number = 1): string`
- `getPastDate(years: number = 1): string`

### 2.4 Banking Amounts & Numbers
Implement static methods:
- `getAmount(min: number = 10, max: number = 1000): number` (float with 2 decimal places)
- `getNumber(min: number = 1, max: number = 999): number`
- `getAccountNumber(): string` (random 5-digit string `10000` to `99999`)

### 2.5 ParaBank API Payload Generators
Implement static methods:

- `generateInvalidLoginPayload()`: returns `{ username, password }` with random credentials.
- `generatePayeePayload()`: returns valid BillPay payee payload:
  - `name`: company name
  - `address`: object containing `street`, `city`, `state`, `zipCode`
  - `phoneNumber`: phone string
  - `accountNumber`: 5-digit account number string
- `generateCustomerProfile()`: returns profile object with `firstName`, `lastName`, `street`, `city`, `state`, `zipCode`, `phoneNumber`, `ssn`.
- `generateLoanApplication(customerId: number, accountId: number, amount: number = 1000, downPayment: number = 250)`: returns `{ customerId, amount, downPayment, fromAccountId }`.
- `generateStockPosition(accountId: number, symbol: string = 'MSFT', shares: number = 5, pricePerShare: number = 320.00)`: returns `{ accountId, name, symbol, shares, pricePerShare }`.
- `generateTransferData(fromAccountId: number, toAccountId: number, amount: number = 50.00)`: returns `{ fromAccountId, toAccountId, amount }`.
- `generateDepositData(accountId: number, amount: number = 100.00)`: returns `{ accountId, amount }`.

## Expected Result
A `utils/dataGenerator.ts` file exporting the `RandomDataUtil` class generating synthetic person, address, date, and ParaBank banking payloads.

---

# 3. Create `DataReader.ts`

## Prompt

Create a file named `DataReader.ts` in the existing folder `utils`.

Use the existing dependencies:
- `fs`
- `csv-parse/sync`
- `xlsx`

Create and export a class named `DataProvider` with these three static methods:

### 3.1 `readJson(filePath: string)`
- Read the JSON file synchronously with UTF-8 encoding.
- Parse and return the parsed JSON object.

### 3.2 `readCsv(filePath: string)`
- Read CSV file synchronously.
- Parse CSV with `columns: true` and `skip_empty_lines: true`.
- Return parsed array of records.

### 3.3 `readExcel(filePath: string)`
- Read the workbook using `XLSX.readFile(filePath)`.
- Extract the first sheet and convert to JSON data using `{ header: 1 }`.
- Return the resulting array.

## Expected Result
A `utils/DataReader.ts` file exporting the `DataProvider` class for reading tabular and JSON test data files.

---

# 4. Final Implementation Quality Criteria

The utility files must:
- Exist in `utils/` with TypeScript file extensions (`.ts`).
- Export exact class names (`Helper`, `RandomDataUtil`, `DataProvider`).
- Conform strictly to ParaBank REST API domain models (accounts, customers, transactions, loans, positions, billpay).
- Contain zero references to external applications (e.g. eCommerce products, carts, or unrelated tutorials).
