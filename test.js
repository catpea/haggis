#!/usr/bin/env node
import { suite, it } from 'node:test';
import assert from 'node:assert/strict';

import haggis from './index.js';

const template = {
  count: 10,
  exclude: false,
  source: [],
  destination: "",
};

const options = {
  strict: true, // property name must be present in the object
  initial: 'positional', // what to use as the default name for positional, if you say 'source' you won't need to use -s
}

const argv = [ '/bin/node', '/home/zerocool/npm/haggis/test.js', '-s', 'index.js', 'package.json', 'test.js', '-d', '/home/acidburn', '--exclude', '-c'];

suite('Command Tests', () => {

  const result = haggis(template, options, argv);
console.log(result)
  it('should return correct shorthand', () => {
    assert.strictEqual(result.exclude, true, 'should be true because we used -e flag that resolves to exclude');
  });

  it('should have source array of 3 items', () => {
    assert.strictEqual(result.source.length, 3, 'should be 3 as we feed it 3 files');
  });

  it('should have correct files', () => {
    assert.deepStrictEqual(result.source, ['index.js', 'package.json', 'test.js'], 'should be index, package, and test');
  });

  it('should return correct destination must be a string', () => {
    assert.strictEqual(result.destination, "/home/acidburn", 'should be /home/acidburn and string');
  });

});
