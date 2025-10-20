#!/usr/bin/env node

import { argv } from 'node:process';
import haggis from 'haggis';

const template = {
  exclude: false,
  source: [],
  destination: "",
};

const options = {
  strict: true, // property name must be present in the object
  initial: 'source', // what to use as the default name for positional, if you say 'source' you won't need to use -s
}

console.log('USAGE: execute this with: * -d /tmp -e');
const result = haggis(template, options, argv);
console.log(result);
