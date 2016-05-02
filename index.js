'use strict';

const LinkedList = require('circular-list');
const document = require('global/document');
const moment = require('moment');
const yo = require('yo-yo');
const random = require('lodash.random');

const matchEmotes = require('match-emotes');
const overrustle = require('overrustle-logs');
const chatmsg = require('./lib/chatmsg');
const usermsg = require('./lib/usermsg');

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

      const combo = {emote: null, count: 0, index: null};
      const updatedChat = [];

      chatLines.forEach((data, i) => {
        const content = data.message.trim();

        // if message contains only an emote
        if (matchEmotes.test(content)) {

          // see if emote is continuing a combo
          if (content === combo.emote) {
            combo.count++;
            updatedChat[combo.index] = chatmsg(combo);
            return;
          }

          // otherwise have it begin a possible combo
          else {
            combo.emote = content;
            combo.count = 1;
            combo.index = i;
          }
        }

        // end any existing combo
        else {
          combo.emote = null;
          combo.count = 0;
          combo.index = null;
        }

        // Either this message is a single emote, but not continuing a combo, or
        // it is not an emote message. Render it as a regular user message.
        updatedChat.push(usermsg(data));
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
