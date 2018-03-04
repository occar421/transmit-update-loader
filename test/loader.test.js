/* eslint-env jest */

import compiler from './compiler.js';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

/**
 * @param {string} fileName
 * @returns {Promise<string>}
 */
const readFileAsync = (fileName) => promisify(fs.readFile)(path.join(__dirname, fileName)).then(b => b.toString());

/**
 * @param {string} fileName
 * @returns {Promise<"fs".Stats>}
 */
const fileStatAsync = (fileName) => promisify(fs.stat)(path.join(__dirname, fileName));

/**
 * @param {string} dirPath
 * @returns {Promise<array<string>>}
 */
const enumerateFilesAsync = (dirPath) => promisify(fs.readdir)(dirPath)
    .then(files => files.map(f => path.join(dirPath, f)).filter(f => fs.statSync(f).isFile()));

afterEach(async () => {
    const files = await enumerateFilesAsync(path.join(__dirname, 'fixtures'));
    files.filter(f => f.endsWith('.null')).forEach(f => {
        fs.unlinkSync(f);
    });
});

test('does not affect file content', async () => {
    const targetFileName = './fixtures/foo.txt';
    const status = await compiler(targetFileName, {});
    const output = status.toJson().modules[0].source;
    expect(output).toBe(await readFileAsync(targetFileName));
});

test('rejects empty option', async () => {
    const targetFileName = './fixtures/foo.txt';
    expect(async () => {
        await compiler(targetFileName, {});
    }).toThrowError(/transmitRules\.test/);
});

// TODO transform function is success?

// test('does not create a new file by default', async () => {
//
// });

// test('renews ctime of the file', async () => {
//     const targetFileName = './fixtures/foo.txt';
//     const preStat = await fileStatAsync(targetFileName);
//     await compiler(targetFileName, {});
//     const postStat = await fileStatAsync(targetFileName);
//     expect(postStat.ctimeMs).toBeGreaterThan(preStat.ctimeMs);
// });