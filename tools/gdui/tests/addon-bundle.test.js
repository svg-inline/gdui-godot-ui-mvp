import assert from "node:assert/strict";
import test from "node:test";
import { validateAddonBundle } from "../../validate-addon-bundle.js";

test("distributed addon bundle contains required runtime files only", () => {
  const result = validateAddonBundle("addons/gdui");

  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});
