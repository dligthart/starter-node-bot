var Botkit = require('botkit');
var Witbot = require('witbot');
var witbot = Witbot('KJN5XTUXGTW27DC7VJ4Y64QX6N7BZXA5');
var slackToken = 'xoxp-23885891238-23890920277-50539946705-f3026a4d17';
var token = process.env.SLACK_TOKEN; //slackToken; //
var controller = Botkit.slackbot({ debug: false });

controller.spawn({ token: token }).startRTM(function (err, bot, payload) {
  if (err) throw new Error('Error connecting to Slack: ', err);
  console.log('Connected to Slack');
});

controller.hears(['hi'], ['direct_message', 'direct_mention'], function (bot, evt) {
  bot.reply(evt, 'hello from bot')
});

controller.hears(['.*'], ['direct_message', 'direct_mention'], function (bot, message) {
  var wit = witbot.process(message.text, bot, message)
	console.log(message.text);
  wit.hears('greeting', 0.53, function (bot, message, outcome) {
		console.log(message, outcome);
    bot.startConversation(message, function (_, convo) {
      convo.say('Hello!');
      convo.ask('How are you?', function (response, convo) {
        witbot.process(response.text)
          .hears('good', 0.5, function (outcome) {
            convo.say('I am so glad to hear it!');
            convo.next();
          })
          .hears('bad', 0.5, function (outcome) {
            convo.say('I\'m sorry, that is terrible');
            convo.next();
          })
          .otherwise(function (outcome) {
            convo.say('I\'m cofused');
            convo.repeat();
            convo.next();
          });
      });
    });
  });

  wit.otherwise(function (bot, message) {
    bot.reply(message, 'You are so intelligent, and I am so simple. I don\'t understand');
  });
});
