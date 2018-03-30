import * as fs from "fs-extra";
import path from "path";

/**
 * @param {string} fileName
 * @returns {Promise<string>}
 */
export const readFileAsync = fileName =>
  fs.readFile(path.join(__dirname, fileName)).then(b => b.toString());

/**
 * @param {string} fileName
 * @returns {Promise<{ctime:Date}>}
 */
export const fileStatAsync = fileName =>
  fs.stat(path.join(__dirname, fileName));

/**
 * @param {string} dirPath
 * @returns {Promise<array<string>>}
 */
const enumerateFilesAsync = dirPath =>
  fs
    .readdir(dirPath)
    .then(files =>
      files.map(f => path.join(dirPath, f)).filter(f => fs.statSync(f).isFile())
    );

/**
 * @param {string} fileName
 * @returns {Promise<boolean>}
 */
export const existsAsync = fileName =>
  fs.pathExists(path.join(__dirname, fileName));

export const removeGeneratedFiles = async () => {
  const files = await enumerateFilesAsync(path.join(__dirname, "fixtures"));
  files.filter(f => f.endsWith(".null")).forEach(f => {
    fs.unlink(f, err => {
      if (err && err.code !== "ENOENT") throw err;
    });
  });
};
