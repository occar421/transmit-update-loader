import compiler from './compiler.js';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

/**
 * @var {jest.Expect} expect
 */

/**
 * @param fileName
 * @returns {Promise<string>}
 */
const readFileAsync = (fileName) => promisify(fs.readFile)(path.join(__dirname, fileName)).then(b => b.toString());

/**
 * @param fileName
 * @returns {Promise<"fs".Stats>}
 */
const fileStatAsync = (fileName) => promisify(fs.stat)(path.join(__dirname, fileName));

test('does not affect file content', async () => {
    const targetFileName = './fixtures/foo.txt';
    const status = await compiler(targetFileName, {});
    const output = status.toJson().modules[0].source;
    expect(output).toBe(await readFileAsync(targetFileName));
});

test('renews ctime of the file', async () => {
    const targetFileName = './fixtures/foo.txt';
    const preStat = await fileStatAsync(targetFileName);
    await compiler(targetFileName, {});
    const postStat = await fileStatAsync(targetFileName);
    expect(postStat.ctimeMs).toBeGreaterThan(preStat.ctimeMs);
});