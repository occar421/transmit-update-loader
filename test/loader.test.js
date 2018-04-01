import compiler from "./compiler";
import {
  removeGeneratedFiles,
  readFileAsync,
  fileStatAsync,
  existsAsync
} from "./helpers";

afterEach(removeGeneratedFiles);

it("should not affect file content in webpack pipeline", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const sourceFileContent = await readFileAsync(sourceFileName);
  const status = await compiler(sourceFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1.null"] }]
  });
  const output = status.toJson().modules[0].source;
  expect(output).toBe(sourceFileContent);
});

it("should not renew itself by default", async () => {
  // to prevent infinite renewing
  const targetFileName = "./fixtures/foo.txt";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(targetFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1"] }]
  }); // identity mapping
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctime.getTime()).toBe(preStat.ctime.getTime());
});

it("should not renew itself within multi targets", async () => {
  // to prevent infinite renewing
  const targetFileName = "./fixtures/foo.txt";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(targetFileName, {
    transmitRules: [{ test: /\/(.*$)/, targets: ["$1", "$1", "foo", "bar"] }]
  });
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctime.getTime()).toBe(preStat.ctime.getTime());
});

it("should not renew itself within multi rules", async () => {
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
  expect(postStat.ctime.getTime()).toBe(preStat.ctime.getTime());
});

it("should renew foo.md from foo.txt", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/foo.md";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".md"] }]
  });
  const postStat = await fileStatAsync(targetFileName);
  expect(postStat.ctime.getTime()).toBeGreaterThan(preStat.ctime.getTime());
});

it("should renew foo.md and foo.asciidoc from foo.txt", async () => {
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
  expect(postStatMd.ctime.getTime()).toBeGreaterThan(preStatMd.ctime.getTime());
  expect(postStatAd.ctime.getTime()).toBeGreaterThan(preStatAd.ctime.getTime());
});

it("should renew foo.md and foo.asciidoc and foo.rst from foo.txt", async () => {
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
  expect(postStatMd.ctime.getTime()).toBeGreaterThan(preStatMd.ctime.getTime());
  expect(postStatAd.ctime.getTime()).toBeGreaterThan(preStatAd.ctime.getTime());
  expect(postStatRst.ctime.getTime()).toBeGreaterThan(
    preStatRst.ctime.getTime()
  );
});

it("should renew foo.md from foo.txt and bar.txt from foo.txt", async () => {
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
  expect(postStatFoo.ctime.getTime()).toBeGreaterThan(
    preStatFoo.ctime.getTime()
  );
  expect(postStatBar.ctime.getTime()).toBeGreaterThan(
    preStatBar.ctime.getTime()
  );
});

it("should not create a new file by default", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/foo.null";
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".null"] }]
  });
  expect(await existsAsync(targetFileName)).toBe(false);
});

it("should create a new file if option is set", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/foo.null";
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".null"] }],
    noCreate: false
  });
  expect(await existsAsync(targetFileName)).toBe(true);
});

it("should renew txt.foo from foo.txt with complex rule", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/txt.foo";
  const preStat = await fileStatAsync(targetFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\w+)\.(txt$)/, targets: ["$2.$1"] }]
  });
  const postStatFoo = await fileStatAsync(targetFileName);
  expect(postStatFoo.ctime.getTime()).toBeGreaterThan(preStat.ctime.getTime());
});

it("should not affect source file content", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const preSourceFileContent = await readFileAsync(sourceFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(.*$)/, targets: ["$1.null"] }],
    noCreate: false
  });
  const postSourceFileContent = await readFileAsync(sourceFileName);
  expect(postSourceFileContent).toBe(preSourceFileContent);
});

it("should not affect target file content", async () => {
  const sourceFileName = "./fixtures/foo.txt";
  const targetFileName = "./fixtures/foo.md";
  const preTargetFileContent = await readFileAsync(targetFileName);
  await compiler(sourceFileName, {
    transmitRules: [{ test: /(\.txt$)/, targets: [".md"] }]
  });
  const postTargetFileContent = await readFileAsync(targetFileName);
  expect(postTargetFileContent).toBe(preTargetFileContent);
});
