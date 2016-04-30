# dgg-chat-replay

Replay `destiny.gg` chat.

This works by downloading logs from overrustlelogs.net and displaying the
messages in chronological order. I've implemented a clone of chat in order to
make this look like live chat.

Some limitations:

  - **subscriber status**: there's currently no API as far as I know for getting
    the subscription tier of a user at a particular point in time. One could
    perhaps look to [the logs of `Subscriber`][1] for the desired month (and
    previous month), but this does not seem like a worthwhile effort to make.
    Instead, I've opted for scraping the subscriber tiers of users currently
    chatting and just using that tier for past events (see `lib/subscribers`).
  - **flairs**: similar to the above, it would be nearly impossible for one to
    know what flairs a user had at a particular time, especially since there is
    no programmatic broadcast of newly-flaired users. Instead, I use the same
    solution as above.
  - **timestamp precision**: unfortunately, `overrustlelogs.net` only records
    message timestamps down to the second. Thus, one can not perfectly recreate
    the flow of chat messages. Messages that are half a second apart will be
    recorded as being either 0 seconds or 1 second apart.


   [1]: http://dgg.overrustlelogs.net/Destinygg%20chatlog/current/Subscriber.txt
