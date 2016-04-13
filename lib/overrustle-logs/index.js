'use strict';

const moment = require('moment');
const hyperquest = require('hyperquest');
const split2 = require('split2');
const overrustleLogsUrl = require('overrustle-logs-url');

function overrustle(opts) {
  function parse(row) {
    return {
      timestamp: moment.utc(row.substring(1, 20)).toISOString(),
      user: row.substring(26, row.indexOf(': ')),
      message: row.substring(row.indexOf(': ') + 2)
    };
  }

  const url = 'http://cors.maxogden.com/' + overrustleLogsUrl(opts);

  return hyperquest(url, {
    headers: {'X-Requested-With': 'dgg-chat-replay'}
  }).pipe(split2(parse));
}
