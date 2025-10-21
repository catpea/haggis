#!/usr/bin/env node
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
const result = haggis(template, options, argv);
console.log(result)
