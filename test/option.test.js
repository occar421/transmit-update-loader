import compiler from "./compiler";
import { removeGeneratedFiles } from "./helpers";

afterEach(removeGeneratedFiles);

it("should reject empty option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, {});
  expect(status.compilation.errors.length).toBe(1);
  const error = status.compilation.errors[0];
  expect(error.name).toBe("ModuleBuildError");
  expect(error.error.name).toBe("ValidationError");
});

it("should reject null `transmitRules` option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, { transmitRules: null });
  expect(status.compilation.errors.length).toBe(1);
  const error = status.compilation.errors[0];
  expect(error.name).toBe("ModuleBuildError");
  expect(error.error.name).toBe("ValidationError");
});

it("should reject object `transmitRules` option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, {
    transmitRules: { test: /(\.$)/, targets: ["$1.null"] },
  });
  expect(status.compilation.errors.length).toBe(1);
  const error = status.compilation.errors[0];
  expect(error.name).toBe("ModuleBuildError");
  expect(error.error.name).toBe("ValidationError");
});

it("should reject string `transmitRules.test` option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  // eslint-disable-next-line no-useless-escape
  const status = await compiler(targetFileName, {
    transmitRules: [{ test: "(.$)", targets: ["$1.null"] }],
  });
  expect(status.compilation.errors.length).toBe(1);
  const error = status.compilation.errors[0];
  expect(error.name).toBe("ModuleBuildError");
  expect(error.error.name).toBe("ValidationError");
});

it("should reject non RegExp `transmitRules.test` option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, {
    transmitRules: [{ test: {}, targets: ["$1.null"] }],
  });
  expect(status.compilation.errors.length).toBe(1);
  const error = status.compilation.errors[0];
  expect(error.name).toBe("ModuleBuildError");
  expect(error.error.message).toMatch(/transmitRules\.test/);
});

it("should accept RegExp `transmitRules.test` option", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, {
    transmitRules: [{ test: /(\.$)/, targets: ["$1.null"] }],
  });
  expect(status.compilation.errors.length).toBe(0);
});
