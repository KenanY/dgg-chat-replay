'use strict';

const LinkedList = require('circular-list');
const document = require('global/document');
const he = require('he');
const linkify = require('linkify-it')();
const moment = require('moment');
const tlds = require('tlds');
const yo = require('yo-yo');
const random = require('lodash.random');

const matchEmotes = require('match-emotes');
const subscribers = require('subscribers');
const overrustle = require('overrustle-logs');

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

// get absolute millisecond difference between message-nodes a and b
function diffNodeTimes(a, b) {
  let diff = Math.abs(moment.utc(a.data.timestamp)
    .diff(moment.utc(b.data.timestamp), 'milliseconds', true));

  // `overrustlelogs.net` only records timestamps at seconds precision, so
  // `diff` will be 0 if two messages occurred within the same UTC second, and
  // it will be 1000ms even if one message occurs just before a second ends and
  // the next message is at the beginning of the new second. Thus, it is
  // impossible to get the exact millisecond difference between two messages.
  // Next best thing might be to just display each message at the average rate
  // of messages per second for the given second. If two messages span two
  // seconds, we just take the average of the two rates.
  if (diff === 0) {
    diff = 1000 / msgCount[moment.utc(a.data.timestamp).format()];
  }
  else if (diff === 1000) {
    diff = 2000 / (msgCount[moment.utc(a.data.timestamp).format()]
      + msgCount[moment.utc(b.data.timestamp).format()]);
  }
  else {
    diff = random(diff / 1000, diff + 999, true);
  }

  return diff;
}

const chatLines = [];

// Keeps track of the number of messages sent in a given second. This is used
// for displaying messages at a rate which approximately mirrors that of live
// chat. Keys are ISO-8601 timestamps and values are integers.
const msgCount = {};

function submit() {
  // clear any previous messages
  chatLines.length = 0;
  yo.update(chat, yo`
    <div class="chat-lines" style="overflow: auto">
      ${chatLines}
    </div>
  `);

  // definitely can do better validation here along with actually displaying an
  // error to the user rather than to the console
  if (!input.value.length || !moment(input.value).isValid()) {
    console.log('invalid date');
    return;
  }

  // doubly linked list, wherein each node represents a message and each node
  // points to the previous message and the next message (we currently only
  // utilize the next message)
  const list = new LinkedList();

  overrustle({
    channel: 'Destinygg',
    date: moment.utc(input.value).format('YYYY-MM-DD')
  }).on('data', (data) => {
    if (moment.utc(data.timestamp).isBefore(moment.utc(input.value))) {
      return;
    }

    const iso = moment.utc(data.timestamp).format();
    if (!msgCount[iso]) {
      msgCount[iso] = 0;
    }
    msgCount[iso]++;

    const node = new LinkedList.Node(data);
    list.append(node);
  }).on('end', () => {
    function traverse(curr) {
      chatLines.push(curr.data);

      const updatedChat = chatLines.map((data) => {
        let content = data.message;

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

        const userFlairs = subscribers[data.user];

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
              : ''}" href="#">${data.user}</a>:
            ${content}
          </div>
        `;
      });

      yo.update(chat, yo`
        <div class="chat-lines overthrow nano-content">
          ${updatedChat}
        </div>
      `);

      // force scroll to bottom
      chat.scrollTop = chat.scrollHeight;

      const next = curr.next;

      // wait before displaying next message
      setTimeout(() => {
        traverse(next);
      }, diffNodeTimes(next, curr));
    }

    traverse(list.first);
  });
}

// this should only contain the input element
const input = yo`
  <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" class="input-sm form-control">
`;

const chat = yo`
  <div class="chat-lines overthrow nano-content"></div>
`;

const el = yo`
  <div class="chat chat-theme-dark chat-icons">
    <div class="chat-output-frame">
      <div class="chat-output nano has-scrollbar">
        ${chat}
        <div class="nano-pane" style="display: block;">
          <div class="nano-slider"
            style="height: 41px; transform: translate(0px, 681px);"></div>
        </div>
      </div>
    </div>

    <div id="chat-top-frame">
      <div class="user-tools active">
        <div class="wrap clearfix">
          <h5>Destiny.gg Chat Replay</h5>
          <div class="tools">
            <div class="user-tools-wrap">
              ${input}
              <button class="btn btn-primary btn-block"
                onclick=${submit}>replay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

document.body.appendChild(el);
