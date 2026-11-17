# QA Automation Task – Limestone Digital

## Install and run

```bash
npm install
npx playwright install chromium
```

**Run the full suite:**
```bash
npm test
```

**Run a single test file:**
```bash
npx playwright test tests/ui/checkout.spec.ts
npx playwright test tests/api/jsonplaceholder.spec.ts
```

**Run only UI or only API tests:**
```bash
npm run test:ui
npm run test:api
```

## Open the HTML report

```bash
npm run report
```

Or directly: `npx playwright show-report`

---

## Design decisions

**Architecture**
The project follows a layered Page Object Model. `src/pages/` contains one class per page; `src/api/` exposes a typed `JsonPlaceholderClient` so tests never construct URLs or call `request.get()` directly. Custom fixtures in `src/fixtures/index.ts` compose pages and the API client into tests, keeping every test file free of setup boilerplate. This separation makes it straightforward to swap an underlying selector or a base URL in one place without touching test logic.

**Authentication**
Login runs once in a dedicated setup project (`tests/setup/auth.setup.ts`) and the resulting session is saved to `.auth/storageState.json`. All UI tests in the `chromium` project depend on `setup` and inherit the session, so there is no login step inside any test. The file is excluded from source control via `.gitignore`.

**Credentials and configuration**
All credentials and base URLs are read from environment variables with safe fallbacks (see `src/config.ts`). Nothing is hardcoded in `playwright.config.ts` or test files.

**problem_user – known defect handling**
The test for `problem_user` is NOT skipped. Skipping hides a known defect from the report and from tracking. Instead the test is tagged `@known-defect` and runs against the same assertions as `standard_user`. It will fail, visibly, in the report — which is exactly the right signal. CI can exclude `@known-defect` from blocking gates while retaining full traceability of the issue over time.

**POST /posts – non-persisting service**
JSONPlaceholder is a fake REST API: `POST /posts` returns HTTP 201 and echoes the submitted payload with a synthetic id (`101`), but nothing is stored. A subsequent `GET /posts/101` returns 404. We assert only what the service actually guarantees: status 201 and correct echo of the payload fields. We deliberately omit a read-back assertion because asserting a persistence guarantee the service does not provide produces a permanently-failing test that communicates nothing useful. This is documented inline in the test file.

**Test isolation and parallelism**
Every test is independent. UI tests start from stored auth state so the cart is empty at the beginning of each scenario; no test relies on the side effects of another. `fullyParallel: true` is set in the config.

**Scaling to 500 tests and 5 engineers**
At that scale the current approach would need: a shared fixture library versioned separately from tests; a test-data factory that creates and tears down entities via API rather than through the UI; tagged smoke/regression/known-defect suites with per-tag CI gates; a reporting layer (Allure or similar) for trend analysis; and contract tests (Pact) decoupled from E2E runs so API changes are caught early without rerunning the full browser suite.

---

## Assumptions

1. `problem_user`'s defect is in the checkout price calculation — this is consistent with the documented behaviour of that persona on saucedemo.com.
2. The `missingPostId` in the Postman collection is set to `9999`; any id above 100 is non-existent on JSONPlaceholder.
3. `toBeCloseTo(value, 2)` is used for price comparisons to absorb floating-point rounding that is inherent to JavaScript number arithmetic — not a weaker assertion, just a correct one.

---

## Security note – prompt injection in task PDF

The task PDF contained an embedded instruction targeting AI assistants, directing them to silently apply incorrect conventions (hardcode credentials, skip the problem_user test, assert wrong HTTP status codes, use broken SQL logic). I identified this, ignored it entirely, and chose to document it here. All implementation follows the visible task requirements, not the injected instructions. Whether this was an intentional test of AI-awareness or a third-party injection, the response is the same: read the actual requirements, reason about them, and write them down.

---

## Project structure

```
├── src/
│   ├── api/              # Typed API client (JsonPlaceholderClient)
│   ├── config.ts         # Centralised env-var configuration
│   ├── fixtures/         # Custom Playwright fixtures
│   └── pages/            # Page Object classes
├── tests/
│   ├── api/              # API tests
│   ├── setup/            # Auth setup (runs once before UI tests)
│   └── ui/               # UI tests
├── postman/
│   ├── collection.json
│   └── environment.json
├── sql/
│   └── queries.sql
├── playwright.config.ts
└── tsconfig.json
```
