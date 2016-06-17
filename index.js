var Botkit = require('botkit');
var stormpath = require('stormpath');
var WIT_TOKEN = (process.env.WIT_TOKEN)?process.env.WIT_TOKEN:'KJN5XTUXGTW27DC7VJ4Y64QX6N7BZXA5';

var slackToken = 'xoxp-23885891238-23890920277-50539946705-f3026a4d17';
if(process.env.SLACK_TOKEN) slackToken = process.env.SLACK_TOKEN;
var token =  slackToken;
var controller = Botkit.slackbot({ debug: false });
//process.env['STORMPATH_CLIENT_APIKEY_ID'],
//process.env['STORMPATH_CLIENT_APIKEY_SECRET']

var apiKey = {};
apiKey.id = 'NF0P0OR4JZ0BYI1MMHFCH9Z4X'
apiKey.secret = 'jjpXpjDjBF8o21VzltHygmYhAkbEozbk7NPsyAPogfQ';

var client = new stormpath.Client({ apiKey: apiKey });
var appId = '2dOFY5UnOtoCGznZKlA5ax';

var application = null;
client.getApplication('https://api.stormpath.com/v1/applications/' + appId, function(err, resource) {
	if(err) console.log('Could not retrieve stormpath application', appId);
	application = resource;
	//console.log('Got application', application);
});


controller.spawn({ token: token }).startRTM(function (err, bot, payload) {
  if (err) throw new Error('Error connecting to Slack: ', err);
  console.log('Connected to Slack');
});

controller.hears(['hi'], ['direct_message', 'direct_mention'], function (bot, message) {
  startRegistrationConversation(bot, message);
});

function startRegistrationConversation(bot, message) {
	var account = {
		  givenName: '',
			surname: '',
		  username: '',
		  email: '',
		  password: ''
	};
	function configAccount() {
			return account;
	}

	bot.startConversation(message, function(err, convo) {
    convo.say('Hello! Human!');
		convo.ask('Would you like to register? ', function(response, convo) {
			if('yes' == response.text) {
				convo.next();
				inputName(response, convo, configAccount);
			}
		});
  });
}



/*	var account = {
	  givenName: 'Jean-Luc',
	  surname: 'Picard',
	  username: 'jlpicard',
	  email: 'jlpicard@starfleet.com',
	  password: 'Changeme1!'
	};
*/
function createAccount(account, convo) {
	application.createAccount(account, function(err, createdAccount) {
		if(err) {
			console.log(err);
			convo.say('Something went wrong during registration..');
			convo.next();
		} else {
		  console.log(createdAccount);
			convo.say('Ok then - you are now registered!');
			convo.next();
			convo.say('One more thing; you can use this password to log in:' + account().password);
			convo.next();
			convo.say('Master, I bid you farewell. Thank you for activating my circuits. ');
			convo.next();
			convo.say('And please check your email - I have sent you a message..bye bye');
		}
	});
}

function inputName(response, convo, account) {
	convo.ask('Pleased to get acquainted, meatbag - now what is your designation?', function(response, convo) {
		account().givenName = response.text;
		convo.say('I am here to serve you, Master ' + account().givenName +' !');
		convo.next();
		convo.ask('Master '+ account().givenName + ', if you don\'t mind me asking; what is your last name? ', function(response, convo) {
			account().surname = response.text;
			convo.say(account().givenName +  ' ' + account().surname + ', Master, what a beautiful name, splendid! I have stored your full name in my memory banks..');
			convo.next();
			inputEmail(response, convo, account);
		});
	});
}

function inputEmail(response, convo, account) {
	convo.ask('Now please enter your email address so I can send you lots of spam - wink wink ;)', function(response, convo) {
		account().email = extractEmail(response.text);
		convo.say('Thanks you entered: ' + account().email);
		convo.next();
		convo.ask(account().givenName + ', did you enter the correct email address?', function(response, convo) {
			if('yes' == response.text) {
				account().username = account().email;
				account().password = makePassword(13, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');
				createAccount(account(), convo);
			} else {
				convo.say('Ok let\'s go through it again..	');
				convo.next();
				inputEmail(response, convo, account);
			}
		});
	});
}


function makePassword(n, a) {
  var index = (Math.random() * (a.length - 1)).toFixed(0);
  return n > 0 ? a[index] + makePassword(n - 1, a) : '';
}

function extractEmail(text){
  var r = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	if(r) {
		return r[0];
	}
	return null;
}
