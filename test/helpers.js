import fs from "fs";
import path from "path";
import { promisify } from "util";

/**
 * @param {string} fileName
 * @returns {Promise<string>}
 */
export const readFileAsync = fileName =>
  promisify(fs.readFile)(path.join(__dirname, fileName)).then(b =>
    b.toString()
  );

/**
 * @param {string} fileName
 * @returns {Promise<"fs".Stats>}
 */
export const fileStatAsync = fileName =>
  promisify(fs.stat)(path.join(__dirname, fileName));

/**
 * @param {string} dirPath
 * @returns {Promise<array<string>>}
 */
const enumerateFilesAsync = dirPath =>
  promisify(fs.readdir)(dirPath).then(files =>
    files.map(f => path.join(dirPath, f)).filter(f => fs.statSync(f).isFile())
  );

export const removeGeneratedFiles = async () => {
  const files = await enumerateFilesAsync(path.join(__dirname, "fixtures"));
  files.filter(f => f.endsWith(".null")).forEach(f => {
    fs.unlinkSync(f);
  });
};
