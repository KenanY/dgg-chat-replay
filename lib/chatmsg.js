const yo = require('yo-yo');

function chatmsg(data) {
  const count = data.count;
  return render();

  function render() {
    let stepClass = '';

    if (count >= 50) {
      stepClass = ' x50';
    }
    else if (count >= 30) {
      stepClass = ' x30';
    }
    else if (count >= 20) {
      stepClass = ' x20';
    }
    else if (count >= 10) {
      stepClass = ' x10';
    }
    else if (count >= 5) {
      stepClass = ' x5';
    }

    return yo`
      <div class="chat-msg">
        <span class="msg">
          <div class="chat-emote chat-emote-${data.emote}"></div>
        </span>
        <span class="emotecount ${stepClass}">
          C-C-C-COMBO: <span>${count}x</span>
        </span>
      </div>
    `;
  }
}

module.exports = chatmsg;
