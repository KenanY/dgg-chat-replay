'use strict';

// my workflow is to run `fetch.js` on destiny.gg/embed/chat, put the resulting
// json into `new.json`, and then run this file in order to merge `new.json`
// into `index.json`

const stringify = require('json-stable-stringify');
const assign = require('lodash.assign');

const merged = stringify(assign(require('./'), require('./new')), {'space': 2});

console.log(merged);
