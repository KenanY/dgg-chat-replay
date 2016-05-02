'use strict';

const emotes = require('destiny.gg-emotes');
const RegexTrie = require('regex-trie');
const isNull = require('lodash.isnull');

const emoteRe = (new RegexTrie()).add(emotes).toRegExp().toString();
let globalRe;
let singleRe;

globalRe = singleRe = emoteRe.substring(1, emoteRe.length - 1);

// construct a regex which matches emotes anywhere in a message
globalRe = new RegExp(globalRe, 'g');

// construct a regex for testing whether or not a message contains nothing but
// a single instance of an emote
singleRe = `^${singleRe}$`;

function matchEmotes(text) {
  const matches = [];

  let match;
  while (!isNull(match = globalRe.exec(text))) {
    matches.push({
      emote: match[0],
      index: match.index,
      lastIndex: globalRe.lastIndex - 1
    });
  }

  return matches.filter((match) => {
    // this is an emote we want to replace if and only if one of the following
    // is true:
    //   1. this emote is the only thing in this text
    //   2. this emote is at index 0 and is succeded by a space
    //   3. this emote is at the end of the text and is preceded by a space
    //   4. this emote preceded and succeded by a space
    return text.length === match.emote.length
      || (text.indexOf(match.emote) === 0 && text[match.lastIndex + 1] === ' ')
      || (text.indexOf(match.emote) + match.emote.length - 1 === text.length - 1
          && text[text.indexOf(match.emote) - 1] === ' ')
      || (text[match.lastIndex + 1] === ' ' && text[match.index - 1] === ' ');
  });
}

function test(text) {
  return (new RegExp(singleRe)).test(text);
}

matchEmotes.test = test;

module.exports = matchEmotes;
