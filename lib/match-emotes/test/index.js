const test = require('tape');
const emotes = require('destiny.gg-emotes');
const matchEmotes = require('../');

test('matches single emotes', (t) => {
  t.plan(emotes.length);

  emotes.forEach((emote) => {
    t.deepEqual(matchEmotes(emote), [{
      emote: emote,
      index: 0,
      lastIndex: emote.length - 1
    }]);
  });
});

test('matches emote at beginning', (t) => {
  t.plan(1);
  t.deepEqual(matchEmotes('ASLAN is so adorable'), [{
    emote: 'ASLAN',
    index: 0,
    lastIndex: 4
  }]);
});

test('matches emote at end', (t) => {
  t.plan(1);
  t.deepEqual(matchEmotes('the most adorable cat is ASLAN'), [{
    emote: 'ASLAN',
    index: 25,
    lastIndex: 29
  }]);
});

test('does not match when emote is adjacent to other text', (t) => {
  t.plan(4);
  t.deepEqual(matchEmotes('MrASLAN'), []);
  t.deepEqual(matchEmotes('ASLANWORTH'), []);
  t.deepEqual(matchEmotes('test ASLANtest test'), []);
  t.deepEqual(matchEmotes('test testASLAN test'), []);
});

test('can test for single emotes', (t) => {
  t.plan(8);
  t.ok(matchEmotes.test('ASLAN'));
  t.ok(matchEmotes.test('WORTH'));
  t.ok(matchEmotes.test('LUL'));
  t.notOk(matchEmotes.test('WORTH '));
  t.notOk(matchEmotes.test(' WORTH'));
  t.notOk(matchEmotes.test(' WORTH '));
  t.notOk(matchEmotes.test('ASLANWORTH'));
  t.notOk(matchEmotes.test('ASLAN WORTH'));
});
