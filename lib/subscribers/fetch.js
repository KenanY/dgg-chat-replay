// run this on destiny.gg/embed/chat

const users = {};

$('a.user').each(function() {
  // remove first element, which all users share: "user"
  const classes = $(this).attr('class').split(/\s+/).slice(1);

  // user is not subscribed, has no flairs, etc. no need to include them
  if (classes[0] === '') {
    return;
  }

  users[$(this).text()] = classes;
});

console.log(JSON.stringify(users));
