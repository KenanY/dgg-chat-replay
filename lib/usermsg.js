const he = require('he');
const linkify = require('linkify-it')();
const tlds = require('tlds');
const yo = require('yo-yo');

const matchEmotes = require('match-emotes');
const subscribers = require('subscribers');

// should revisit the usefulness of this
linkify.tlds(tlds);

const flairs = {
  protected: 'protected',
  subscriber: 'subscriber',
  flair9: 'minitwitch',
  flair1: 'subscribert2',
  flair3: 'subscribert3',
  flair8: 'subscribert4',
  vip: 'vip',
  moderator: 'moderator',
  admin: 'admin',
  bot: 'bot',
  flair2: 'notable',
  flair4: 'trusted',
  flair5: 'contributor',
  flair6: 'compchallenge',
  flair7: 'evenotable'
};

function usermsg(data) {
  const user = data.user;
  const msg = data.message;
  const userFlairs = subscribers[data.user];
  return render();

  function render() {
    let content = msg;

    if (linkify.test(content) || matchEmotes(content).length) {
      const tokens = content.split(' ');
      const result = [];

      tokens.forEach((token) => {
        if (linkify.test(token)) {
          const matches = linkify.match(token);
          matches.forEach((match) => {
            result.push(yo`
              <a target="_blank" href="${he.escape(match.url)}">
                ${he.escape(match.text)}
              </a>
            `);
          });
        }
        else if (matchEmotes(token).length) {
          const matches = matchEmotes(token);
          matches.forEach((match) => {
            result.push(yo`
              <div class="chat-emote chat-emote-${match.emote}"></div>
            `);
          });
        }
        else {
          result.push(token + ' ');
        }
      });

      content = yo`<span class="msg ${content.indexOf('>') === 0
        ? 'greentext'
        : ''}">${result}</span>`;
    }
    else {
      content = yo`<span class="msg ${content.indexOf('>') === 0
        ? 'greentext'
        : ''}">${content}</span>`;
    }

    return yo`
      <div class="user-msg">
        ${userFlairs ? userFlairs.map((flair) => {

          // Add this flair icon if and only if one of the following is
          // true:
          //   1. flair is not one of: subscriber, moderator, protected
          //   2. flair is subscriber AND is a T1 subscriber
          if ((flair !== 'subscriber'
            && flair !== 'moderator'
            && flair !== 'protected')
            || (flair === 'subscriber'
            && userFlairs.indexOf('flair1') < 0
            && userFlairs.indexOf('flair3') < 0
            && userFlairs.indexOf('flair8') < 0))
          return yo`<i class="icon-${flairs[flair]}"></i>`;
        }) : ''}
        <a class="user ${userFlairs
          ? userFlairs.join(' ')
          : ''}" href="#">${user}</a>:
        ${content}
      </div>
    `;
  }
}

module.exports = usermsg;
