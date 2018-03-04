import compiler from './compiler.js';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readFileAsync = (fileName) => promisify(fs.readFile)(path.join(__dirname, fileName)).then(b => b.toString());

test('does not affect file content', async () => {
    const targetFileName = './fixtures/foo.txt';
    const status = await compiler(targetFileName, {});
    const output = status.toJson().modules[0].source;
    expect(output).toBe(await readFileAsync(targetFileName));
});