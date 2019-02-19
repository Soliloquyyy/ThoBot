//importing discord
const Discord = require("discord.js");
const client = new Discord.Client({autoReconnect:true});
//importing configs and const strings
const config = require("./config/config.json");
const auth = require("./private/auth.json");
const copypasta = require("./config/copypasta.json");
const privateConst = require("./private/privateConst.json");
const messageProcessing = require('./message/messageProcessing.js');
const welcomeHandler = require('./osu!ucsd/welcomeHandler.js');
const readline = require('readline');
const redditTrack = require("./redditTracker/subreddit.js")


//event to log that bot is on
client.on("ready", () => {
	//set game play;
	client.user.setActivity('with Chris <3 owo');
	redditTrack.setupReddit(client);
	console.log(config.ready);	
	return;
});

//event for someone joining osu! ucsd server
//remove this block or else it won't run
client.on("guildMemberAdd", member => {
	welcomeHandler.welcomeHandler(member);
	return;
});

//even for when there is a new message
client.on("message", message => {
	messageProcessing.process(message);
	return;
});





//start client
start(client);

/* function: iconSearch(args, message);
* Description: start the bot and then prompt owner for commands
* input
* @param client: discord client object only. used for processing command
* 
* return values: nothing
* side effect: recursively create more function on stack unless 
* "exit" is entered.
*/
async function start(client){
	//logs in with client token
	await client.login(auth.discordToken);
	//get stdin/out
	const rl = readline.createInterface({
		 input: process.stdin,
		 output: process.stdout
	});
	recursiveAsyncReadLine(client,rl)
}

/* function: recursiveAsyncReadLine(client, rl);
* Description: recursively ask for commands
* @param client: discord client object only. used for processing command
* @param rl: readline interface object
* 
* return values: nothing
* side effect: recursively create more function on stack unless 
* "exit" is entered.
*/
var recursiveAsyncReadLine = function (client,rl) {
  rl.question('Command: ', function (answer) {
  	//closing RL and returning from function.
    if (answer == 'exit'){
      return rl.close(); 
    }
    //process the message
    messageProcessing.prompt(answer,client);
    //Calling this function again to ask new question
    recursiveAsyncReadLine(client,rl); 
  });
};


