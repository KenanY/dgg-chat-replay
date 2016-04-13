'use strict';

const emotes = require('destiny.gg-emotes');
const RegexTrie = require('regex-trie');
const isNull = require('lodash.isnull');

// construct a regex which matches emotes
let re = (new RegexTrie()).add(emotes).toRegExp().toString();
re = re.substring(1, re.length - 1);
re = new RegExp(re, 'g');

function matchEmotes(text) {
  const matches = [];

  let match;
  while (!isNull(match = re.exec(text))) {
    matches.push({
      emote: match[0],
      index: match.index,
      lastIndex: re.lastIndex - 1
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

module.exports = matchEmotes;
