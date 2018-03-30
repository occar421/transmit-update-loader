import compiler from "./compiler";
import { removeGeneratedFiles, readFileAsync, fileStatAsync } from "./helpers";

afterEach(removeGeneratedFiles);

test("does not affect file content", async () => {
  const targetFileName = "./fixtures/foo.txt";
  const status = await compiler(targetFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1.null"] }]
  });
  const output = status.toJson().modules[0].source;
  expect(output).toBe(await readFileAsync(targetFileName));
});

test("does not renew itself", async () => {
  // to prevent infinite renewing
  const targetFileName = "./fixtures/foo.txt";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(targetFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1"] }]
  }); // identity mapping
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctimeMs).toBe(preStat.ctimeMs);
});

test("does not renew itself within multi targets", async () => {
  // to prevent infinite renewing
  const targetFileName = "./fixtures/foo.txt";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(targetFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1", "$1", "foo", "bar"] }]
  });
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctimeMs).toBe(preStat.ctimeMs);
});

test("does not renew itself within multi rules", async () => {
  // to prevent infinite renewing
  const targetFileName = "./fixtures/foo.txt";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(targetFileName, {
    transmitRules: [
      { test: /\/(.*$)/, targets: ["$1", "$1", "foo", "bar"] },
      { test: /\/(.*$)/, targets: ["$1", "$1", "foo", "bar"] }
    ]
  });
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctimeMs).toBe(preStat.ctimeMs);
});

test("renews foo.md from foo.txt", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/foo.md";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".md"] }]
  });
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctimeMs).toBeGreaterThan(preStat.ctimeMs);
});

test("renews foo.md and foo.asciidoc from foo.txt", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetMdFileName = "./fixtures/foo.md";
  const targetAdFileName = "./fixtures/foo.asciidoc";
  const preStatMd = await fileStatAsync(targetMdFileName);
  const preStatAd = await fileStatAsync(targetAdFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".md", ".asciidoc"] }]
  });
  const postStatMd = await fileStatAsync(targetMdFileName);
  const postStatAd = await fileStatAsync(targetAdFileName);
  expect(postStatMd.ctimeMs).toBeGreaterThan(preStatMd.ctimeMs);
  expect(postStatAd.ctimeMs).toBeGreaterThan(preStatAd.ctimeMs);
});

test("renews foo.md and foo.asciidoc and foo.rst from foo.txt", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetMdFileName = "./fixtures/foo.md";
  const targetAdFileName = "./fixtures/foo.asciidoc";
  const targetRstFileName = "./fixtures/foo.rst";
  const preStatMd = await fileStatAsync(targetMdFileName);
  const preStatAd = await fileStatAsync(targetAdFileName);
  const preStatRst = await fileStatAsync(targetRstFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".md", ".asciidoc", ".rst"] }]
  });
  const postStatMd = await fileStatAsync(targetMdFileName);
  const postStatAd = await fileStatAsync(targetAdFileName);
  const postStatRst = await fileStatAsync(targetRstFileName);
  expect(postStatMd.ctimeMs).toBeGreaterThan(preStatMd.ctimeMs);
  expect(postStatAd.ctimeMs).toBeGreaterThan(preStatAd.ctimeMs);
  expect(postStatRst.ctimeMs).toBeGreaterThan(preStatRst.ctimeMs);
});

test("renews foo.md from foo.txt and bar.txt from foo.txt", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFooFileName = "./fixtures/foo.md";
  const targetBarFileName = "./fixtures/bar.txt";
  const preStatFoo = await fileStatAsync(targetFooFileName);
  const preStatBar = await fileStatAsync(targetBarFileName);
  await compiler(sourceFileName, {
    transmitRules: [
      { test: /(\.txt$)/, targets: [".md"] },
      { test: /(foo)/, targets: ["bar"] }
    ]
  });
  const postStatFoo = await fileStatAsync(targetFooFileName);
  const postStatBar = await fileStatAsync(targetBarFileName);
  expect(postStatFoo.ctimeMs).toBeGreaterThan(preStatFoo.ctimeMs);
  expect(postStatBar.ctimeMs).toBeGreaterThan(preStatBar.ctimeMs);
});

// TODO
// test('does not create a new file by default', async () => {
//
// });
// test('creates a new file if option is set', async () => {
//
// });
