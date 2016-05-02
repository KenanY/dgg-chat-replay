const yo = require('yo-yo');

function chatmsg(data) {
  return render();

  function render() {
    return yo`
      <div class="chat-msg">
        <span class="msg">
          <div class="chat-emote chat-emote-${data.emote}"></div>
        </span>
        <span class="emotecount">
          C-C-C-COMBO: <span>${data.count}x</span>
        </span>
      </div>
    `;
  }
}

module.exports = chatmsg;
