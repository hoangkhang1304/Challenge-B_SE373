// auth.test.ts (excerpt)
test("concurrent refresh issues exactly one new token", async () => { /* 2 parallel refreshes, same token */ });
test("old token rejected after rotation", async () => { /* reuse old token -> expect 401 */ });
