var Botkit = require('botkit');

var WIT_TOKEN = (process.env.WIT_TOKEN)?process.env.WIT_TOKEN:'KJN5XTUXGTW27DC7VJ4Y64QX6N7BZXA5';

var slackToken = 'xoxp-23885891238-23890920277-50539946705-f3026a4d17';
if(process.env.SLACK_TOKEN) slackToken = process.env.SLACK_TOKEN;
var token =  slackToken;
var controller = Botkit.slackbot({ debug: true });

controller.spawn({ token: token }).startRTM(function (err, bot, payload) {
  if (err) throw new Error('Error connecting to Slack: ', err);
  console.log('Connected to Slack');
});

controller.hears(['hi'], ['direct_message', 'direct_mention'], function (bot, message) {
  startRegistrationConversation(bot, message);
});

function startRegistrationConversation(bot, message) {
	bot.startConversation(message, function(err, convo) {
    convo.say('Hello! Human!');
		convo.ask('Would you like to register? Let\'s start with your email address, please enter.', function(response,convo) {
      convo.say('Thanks you entered:' + response.text);
      convo.next();
			convo.ask('Did you enter the correct email address?', function(response, convo) {
				if('yes' == response.text) {
					convo.say('Ok then - you are now registered!');
					convo.next();
				} else {
					convo.say('Ok let\'s go through it again..	');
					convo.next();
				}
			});
		});
  });


}
