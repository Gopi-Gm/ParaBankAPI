# Sample JIRA Requirement Analysis

Below is an end-to-end example of analyzing a real-world user story using `jira-req-analyzer-skill`.

---

## Input User Story: JIRA-4029 - One-Click Checkout with Saved Payment Methods

```text
Ticket: JIRA-4029
Title: Enable One-Click Express Checkout for Returning Customers with Saved Cards
Issue Type: Story
Story Points: 5
Reporter: Sarah Jenkins (Product Owner)

Description:
As a returning logged-in customer with at least one saved payment method,
I want to use a one-click checkout button on the product details page,
So that I can complete my purchase quickly without navigating through the multi-step checkout funnel.

Acceptance Criteria:
1. User sees "Express Buy" button on Product Details Page (PDP) if they are logged in and have a saved valid credit card.
2. Clicking "Express Buy" immediately charges the default saved card and places the order with default shipping address.
3. User sees order confirmation screen with order summary and tracking ID.
4. If payment fails, show a failure message and redirect to standard checkout.
5. Must be fast and responsive.
```

---

## Generated Output Report

# Requirement Analysis Report: JIRA-4029 - One-Click Express Checkout

- **Review Date:** 2026-11-20
- **Analyzed By:** Senior QA Analyst
- **Ticket Type:** Story
- **Component / Module:** Checkout & Payment Gateway
- **Target Release:** Sprint 42 / v3.8.0
- **Author / Product Owner:** Sarah Jenkins

---

## 1. Executive Verdict & Testability Score

| Verdict | 🟢 READY FOR TEST DESIGN | 🟡 CONDITIONALLY READY | 🔴 NOT READY (BLOCKED) |
|---|:---:|:---:|:---:|
| **Selected** | [ ] | [ ] | [X] |

- **Blocker Count:** 4 critical blockers (Accidental double-click charging, out-of-stock race condition, CVV/SCA 3DS regulatory requirements, and missing address verification).
- **Testability Confidence:** Low (High business & regulatory risk).
- **Executive Summary:** While the happy path intent is clear, the acceptance criteria fail to address payment regulation compliance (3D Secure / SCA), inventory race conditions, double-click idempotency, and explicit error scenarios. Proceeding to implementation without resolving these will lead to duplicate charges and compliance failures.

---

## 2. Requirement Checklist & Scoring

| Dimension | Criteria | Status | Observations & Evidence |
|---|---|:---:|---|
| **Clarity** | Unambiguous language | ⚠️ | "Must be fast and responsive" is subjective and untestable without SLA metrics (e.g. <1.5s). |
| **Completeness** | All user paths covered | ❌ | What happens if the default card is expired? What if default shipping address is missing or invalid? |
| **Negative Scenarios** | Invalid/empty states | ❌ | No handling defined for out-of-stock items, price changes between page view and click, or network timeout. |
| **Error Handling** | Exact messages and codes | ❌ | AC #4 says "show a failure message", but gives no text, placement, or retry mechanism. |
| **Regulatory / Security**| Payment regulations (3DS/PCI) | ❌ | In EU/UK, Strong Customer Authentication (SCA) requires 3DS OTP. One-click direct charge without confirmation breaks compliance. |
| **Idempotency** | Double submission prevention | ❌ | No mention of button debouncing or backend idempotency key. Fast double-clicking could double-charge. |
| **Dependencies** | Downstream microservices | ⚠️ | Dependencies on Payment Gateway, Inventory Service, and Tax calculation engine are unstated. |
| **UI & UX Assets** | Wireframes / Figma | ⚠️ | No mockup attached showing placement of "Express Buy" relative to "Add to Cart" and variant selectors. |

---

## 3. Detailed Findings

### ❌ Gaps (Missing Requirements)
- **GAP-01: Strong Customer Authentication (SCA / 3DS) Flow:** If the bank challenges the transaction for 3D Secure OTP verification, how is the modal handled on the PDP? One-click cannot bypass European/RBI banking security regulations.
- **GAP-02: Default Shipping Address Missing/Invalid:** What happens if the user has a saved card but has deleted or not set a default shipping address, or if the address is outside shipping zones for that specific product?
- **GAP-03: Inventory & Price Race Conditions:** If the item went out of stock or changed price 5 seconds before the user clicked "Express Buy", what validation occurs before charging the card?
- **GAP-04: Button Debouncing & Idempotency Key:** If a customer double-clicks "Express Buy", is the button disabled immediately, and does the client send a unique UUID `Idempotency-Key` to prevent double debiting?

### ⚠️ Ambiguities (Dual Interpretations)
- **AMB-01: Card Expiration Validation**
  - *Text:* AC #1: "...have a saved valid credit card."
  - *Interpretation A (Client-side):* Check is performed on page render; if card expires this month, button is hidden.
  - *Interpretation B (Server-side):* Button is shown, but clicking triggers backend validation resulting in an error toast.
  - *Proposed resolution:* Button should only show if at least one unexpired card is on file; tooltip/indicator should suggest updating expired cards.
- **AMB-02: "Fast and Responsive"**
  - *Text:* AC #5: "Must be fast and responsive."
  - *Interpretation A:* UI animations run at 60fps.
  - *Interpretation B:* Complete API transaction responds in under 2000ms.
  - *Proposed resolution:* Define API response SLA: P95 < 1500ms; UI loading spinner displays within 100ms of click.

### 🚨 Technical & Business Risks
- **RSK-01 (Critical): Duplicate Payment Charges:** Without frontend disabling and backend idempotency keys, jitter/double-clicks will trigger duplicate charge requests to Stripe/Adyen.
- **RSK-02 (High): Accidental Purchases:** Single click without a confirmation popup or 5-second undo timer can lead to high volume of accidental orders and customer support refund requests.

---

## 4. Actionable Questions for the Product Owner

1. **[Payment Security]:** How should the 3D Secure / OTP verification challenge be presented on the Product Details Page when triggered by the card issuer?
2. **[Idempotency & Debounce]:** Can we confirm that clicking "Express Buy" immediately disables the button, shows a spinner, and sends an `Idempotency-Key` header?
3. **[Shipping Validation]:** If a user's default shipping address cannot deliver this specific SKU (e.g. hazmat or international restrictions), should we redirect them to standard checkout with an informative banner?
4. **[Confirmation Safeguard]:** Should we introduce a confirmation bottom-sheet (showing item price, shipping cost, tax, total, and last 4 digits of card) before the final charge, or an "Undo Order" window?
5. **[Performance SLA]:** Can we specify the target timeout threshold (e.g., abort charge and notify user if payment gateway does not respond within 8 seconds)?

---

## 5. Human Review Gate & Assumptions Log

### Assumptions Made:
- Assumed Stripe / Adyen is the underlying payment processor.
- Assumed tax and shipping calculation must be computed dynamically before charging.

### Sign-off:
- [x] Findings reviewed by QA Engineer
- [ ] Questions submitted to Product Owner in JIRA
- [ ] Ticket updated with resolved ACs
