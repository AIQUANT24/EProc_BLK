# NMICOV — Test Documentation

## Document Control

| Field          | Value                    |
| -------------- | ------------------------ |
| Document Title | Test Suite Documentation |
| Version        | 1.1                      |
| Last Updated   | 2026-03-09               |

---

## 1. Test Infrastructure

| Component         | Technology                                  |
| ----------------- | ------------------------------------------- |
| Test Runner       | Vitest 3.x                                  |
| Environment       | jsdom                                       |
| Assertion Library | Vitest built-in + @testing-library/jest-dom |
| Component Testing | @testing-library/react                      |

### Configuration

- `vitest.config.ts` — Test runner config with React plugin, jsdom environment
- `src/test/setup.ts` — Global setup with jest-dom matchers and matchMedia polyfill

### Running Tests

```bash
npx vitest run          # Single run
npx vitest              # Watch mode
npx vitest run --coverage  # With coverage
```

---

## 2. Test Files

### 2.1 DVA Engine Tests (`src/test/dva-engine.test.ts`)

**15 tests** covering the core DVA calculation engine.

| Test Group            | Tests | Description                                     |
| --------------------- | ----- | ----------------------------------------------- |
| `classify`            | 3     | Class I/II/Non-Local boundary testing           |
| `calculateDVA`        | 7     | DVA formula, edge cases, confidence/risk bounds |
| `calculateConfidence` | 2     | Factor dimensions, weight validation            |
| `whatIfAnalysis`      | 3     | Origin switching, cost changes, no-op scenarios |

**Key assertions:**

- DVA = (domestic cost / total cost) × 100
- Classification boundaries: 50% (Class I), 20% (Class II)
- Confidence and risk scores bounded [0, 1]
- Confidence factor weights sum to exactly 1.0
- What-if correctly modifies origin/cost without mutating original

### 2.2 Fraud Engine Tests (`src/test/fraud-engine.test.ts`)

**11 tests** covering all 6 fraud detection rules.

| Rule                    | Tests | Positive/Negative                     |
| ----------------------- | ----- | ------------------------------------- |
| FR-01 (DVA Jump)        | 3     | Jump >15%, small change, no previous  |
| FR-04 (Cost Anomaly)    | 2     | Import >60%, import <60%              |
| FR-05 (Circular Supply) | 2     | 3+ in-house, few in-house             |
| FR-06 (Missing Cost)    | 2     | Zero cost, all positive               |
| Multi-rule              | 1     | Multiple rules trigger simultaneously |
| getAllRules             | 1     | Returns rules without check functions |

### 2.3 Blockchain Simulation Tests (`src/test/blockchain-sim.test.ts`)

**7 tests** covering the simulated Hyperledger Fabric ledger.

| Test                    | Description                           |
| ----------------------- | ------------------------------------- |
| Valid entry creation    | All fields populated correctly        |
| Hash chain linkage      | Previous hash matches prior tx hash   |
| Unique hashes           | 10 entries produce 10 unique hashes   |
| Monotonic block numbers | Block numbers always increment        |
| Seed entries exist      | Pre-populated ledger is non-empty     |
| Seed structure valid    | All seed entries have required fields |
| Seed immutability       | getSeedEntries returns copies         |

### 2.4 Integration Flow Tests (`src/test/integration-flow.test.ts`)

**8 tests** covering the DVA → Classification → Compliance pipeline.

| Test                     | Input       | Expected         |
| ------------------------ | ----------- | ---------------- |
| Class I compliant        | 62.8% DVA   | Class I          |
| Class II boundary        | 20% DVA     | Class II         |
| Non-Local non-compliant  | 15.2% DVA   | Non-Local        |
| DVA formula verification | ₹154K/₹245K | 62.86% → Class I |
| Edge: exactly 50%        | 50%         | Class I          |
| Edge: exactly 20%        | 20%         | Class II         |
| Edge: 0%                 | 0%          | Non-Local        |
| Edge: 100%               | 100%        | Class I          |

---

## 3. Test Results Summary

```
 ✓ src/test/example.test.ts          (1 test)
 ✓ src/test/blockchain-sim.test.ts   (7 tests)
 ✓ src/test/integration-flow.test.ts (8 tests)
 ✓ src/test/dva-engine.test.ts       (15 tests)
 ✓ src/test/fraud-engine.test.ts     (11 tests)

 Test Files  5 passed (5)
      Tests  42 passed (42)
```

---

## 4. Test Coverage Areas

| Area                 | Covered | Notes                           |
| -------------------- | ------- | ------------------------------- |
| DVA Calculation      |         | Formula, boundaries, edge cases |
| Classification Logic |         | All three classes + boundaries  |
| Confidence Scoring   |         | Factor weights, score bounds    |
| Risk Assessment      |         | Score bounds verification       |
| What-If Analysis     |         | Origin switch, cost change      |
| Fraud Rules (6/6)    |         | Positive and negative cases     |
| Multi-Rule Triggers  |         | Simultaneous alert generation   |
| Blockchain Chain     |         | Hash linkage, uniqueness        |
| Ledger Seeding       |         | Pre-populated entries           |
| Integration Flow     |         | End-to-end DVA → Compliance     |
