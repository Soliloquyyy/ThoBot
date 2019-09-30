/*getting the required files
* auth.json should contain the followings:
* "discordToken" : your discord api token;
* "botid": your bot id (you can find by rightclicking your bot and copyid with developer mode);
* "myServer": DO NOT replace your server id(please leave it blank or use random chars);
* you don't need private const so just create an empty file so the compiler compiles
*/
//required files
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const copypasta = require("../config/copypasta.json");
const privateConst = require("../private/privateConst.json");
const youtubeSearch = require("../youtubeapi/youtubeSearch.js");
const poweroftwoBoard = require("../2048Game/Board.js");
const roleHandler = require('../osu!ucsd/roleHandler.js');
const osuApi = require("../osuApi/osuApi.js");
var bmresp = [];
var osuJsonCount = -1;

//these are function call so when process is called
//it will call the right function for processing
//these are also bot commands so it should be easy to add commands here
//@param these functions will take in args and messages that is passed.
//to call this function either do parsedCommands.*functionhere*
//or call parsedCommands["*functionhere*"](args,message);
var parsedCommands = {
	//will call fresh with tts
	freshtts: async function(args,message){
		await Process.freshProcess(args, true, message);
		return;
	},
	//will call fresh without tts
	fresh: async function(args,message){
		await Process.freshProcess(args, false, message);
		return;
	},
	//calling geton from process object
	geton: async function(args,message){
		await Process.getonMention(args,message);
		return;
	},
	//calling icon from process object
	icon: async function(args,message){
		await Process.iconSearch(args,message);
		return;
	},
	//calling 2048 board game
	"2048": async function(args,message){
		await Process.process2048(args, message);
		return;
	},
	//calling boardgame connectfour
	connectfour: async function(args,message){
		await Process.connectFour(message);
		return;
	},
	//calling boardgame resetboard
	resetboard: async function(args,message){
		await Process.resetConnectBoard(message);
		return;
	},
	//calling play youtube process
	play: async function(args,message){
		await Process.playYT(args,message);
		return;
	},
	//when user talks about chris might have side effect
	chris: async function(args,message){
		//not server where chris is in
		if(message.channel.id != privateConst.myServer){
			return;
		}
		await Process.respondsChris(args,message);
		return;
	},
	//convert user input into big letters
	yoink: async function(args,message){
		await Process.bigLetters(args,message);
		return;
	},
	//connectfour making moves
	c4: async function(args,message){
		await Process.connectFourMove(args,message);
		return;
	},
	//pacer copy pasta
	pacer: async function(args,message){
		await Process.pacerTTS(args,message);
		return;
	},
	//get random beatmap on osu
	getbeatmap: async function(args, message){
		await Process.getBeatmap(args, message);
		return;
	},
	//track command for standard osu
	track: async function(args, message){
		await Process.trackOsu(args, message);
		return;
	},	
	//do not need processing commands
	//lobby 
	lobbyme: async function(args,message){
		await Process.lobby(args,message);
		return;
	},
	//will send YT channel
	plug: async function(arg,message){
		try{
			message.channel.send(config.PlugYT + config.cuteF);
			message.channel.send(config.PlugYT2);
		} catch(err){
			console.log(err);
			return;
		}
		return;
	},
	//will send to channel the clone image url
	shadowclone: async function(args,message){
		//doesn't need process just send and return immediately
		try{
			message.channel.send(config.shadowclone);
		} catch(err){
			console.log(err);
			return;
		}
		return;
	},
	dab: async function(args, message){
		try{
			message.channel.send(config.dabLink);
		} catch(err){
			console.log(err);
			return;
		}
		return;
	},
	dabs: async function(args, message){
		await parsedCommands.dab(args, message);
	}
};

module.exports.prompt = async function(message,client){
	var index = message.indexOf("send ");
	if(index> -1){
		let splitarr = message.slice(5).trim().split(/ +/g);
		try{
			client.channels.get(splitarr[0]).send([splitarr[1]]);
		}catch(err){
			console.log(err);
			return;
		}
	}
}
/* export function: process(message)
* @param message: the message from discord event trigger "message"
* return values: -1 if bot did not successfully process, -2 if message doesn't contain the bot name
* description:
* will process the message parameter. the function checks if tho is mentioned in the message.
* if so, the function will process the messages in accordance to what is inputed by the user calling.
*/
module.exports.process = async function(message){
	//checks if belong to a channel
	if(!message.guild) return config.reterror;
	//checks if bot
	if(message.author.id == "473650641844043806") return config.reterror;

	//handling roles on private server remove if need
	if(message.channel.id == privateConst.osuucsdChannel){
		roleHandler.roleHandler(message);
		return;
	}




	//checks if message has jarek name (inside joke)
	/*
	if(message.guild.id == privateConst.osuucsdid){
		var returnMessage = "";
		let ret = [];
		ret = await checkBanWords(message, returnMessage);
		console.log(returnMessage);
		if(ret[0] != "0"){
			await deleteBanMessage(message, ret);
		}
	}*/

	//check if message contains the prefix of bot to answer
    if (message.content.toLowerCase().indexOf(config.pref) <= config.reterror
    	 || message.author.bot) return config.retNotTho;

    //get message content
	var content = message.content;
	if(content.indexOf(config.sad) > -1){
		message.channel.send(config.sadRes);
	}
    //takes in commands and args
	//get index for prefix 
	const prefixIndex = message.content.toLowerCase().indexOf(config.pref);

	//check if message has multiple commands
	var commands = [""];
	var loopindex = 1;
	var lastIndex = 0;
	var biggerThanPre = 0;
	while(content.indexOf(config.and, lastIndex + 1) > config.reterror){
		console.log("in while loop");
		lastIndex = content.indexOf(config.and, lastIndex + 1);
		let nextIndex = content.indexOf(config.and, lastIndex + 1);
		//console.log(lastIndex);
		//console.log(nextIndex);
		if(prefixIndex < lastIndex && biggerThanPre == 0){
			biggerThanPre = lastIndex;
		}
		if(nextIndex <= config.reterror){
			commands[loopindex] = content.substring(lastIndex,content.length);
			break;
		}
		else{
			commands[loopindex] = content.substring(lastIndex,nextIndex);
		}
		loopindex++;
	}
	

	//check if there is extra commands to parse in first command
	var firstC = "";
	if(commands.length != 1){
		//check for commands after
		if(biggerThanPre != 0){
			firstC = content.substring(prefixIndex,biggerThanPre);
		}
		else{
			firstC = content.substring(prefixIndex,content.length);
		}
	}
	else{
		firstC = content.substring(prefixIndex, content.length);
	}
	commands[0] = firstC;
	console.log(commands);
	//get args
	var args = [];
	//slice and trim out the commands and args
	args[0] = commands[0].slice(config.pref.length).trim().split(/ +/g);
	commands[0] = args[0].shift().toLowerCase();
	for (var i = 1; i < commands.length; ++i) {
		args[i] = commands[i].slice(config.and.length).trim().split(/ +/g);
		commands[i] = args[i].shift().toLowerCase();
	}
	//console.log(commands);

	//loop through all command and execute
	for (var i = 0; i < 5/*command.length but this prevents abuse*/; ++i){
		try{
			await parsedCommands[commands[i]](args[i],message);
		} catch(err){
			//console.log(err);
			//send err message and shortly delete it
			//message.channel.send(config.noComprende + "\n`" + commands[i] + config.notCommand + "`").then(msg => {
		//		msg.delete(10000);
		//	}).catch(console.err);
			continue;
		}
	}


};




var Process = {
	/* Process function: findUserMention(user, message);
	* description: find user mentioned from message.
	* @param user: user to find
	* @param message: the OP message object that contains details 
	* about the message
	* return values: notHere("-2") if user is not found
	* 				 their id if they are here.
	* side effect: might be wrong if there are nicknames
	*/
	findUserMention: async function(user, message){
		var notHere = "-2";
		//var to capture whats found thats matched
		try{
			const foundMember = await message.guild.members.find(finduser => 
				finduser.displayName.toLowerCase() === user.toLowerCase());
			//check return values and return
			if(foundMember == false){
				console.log("found member false");
				return notHere;
			}
			else{
				console.log("found member true")
				return foundMember;
			}
		} catch(err){
			console.log(config.findUserErr + err);
			return config.reterror;
		}

		
	},
	/* Process function: freshProcess(args, ttsBol, message);
	* Description: print fresh copypasta and mention person
	* @param args: mostly name of person
	* @param message: the OP message object that contains details 
	* about the message
	* @param ttsBol: to send as talk to speech or no
	* 
	* return values: nothing
	* side effect: will send and call chris(only on my server)
	* also send two messages for tts to work
	*/
	freshProcess: async function(args, ttsBol, message){
		//check if no argument
		if(typeof args[0] == 'undefined'){
			//only to my own server for mentioning chris other wise return
			if(auth.myServer == message.guild.id){
				//find chris id
				var ret = await Process.findUserMention(privateConst.chrisDName);

				//errors
				if(ret == -2){
					message.channel.send("Chris isnt here dummy!");
					return;
				}
				else if(ret == -1){
					message.channel.send(config.freshErr + config.findErr);
					return;
				}


				//no err at all
				else{
					ret = ret.id;
					//if chris is present then message with this
					const chrisid = "<@" + ret + ">";
					try{
					message.channel.send(config.freshtts1 + personid + config.freshtts2, {
						tts: ttsBol
					});
					message.channel.send(config.freshtts3, {
						tts: ttsBol
					});
					}catch(err){
						console.log(config.freshErr + err);
						return;
					}
				}
				return;
			}
			//for other channels
			else{
				try{
					message.channel.send(config.freshErr + config.noUser);
					return;
				} catch(err){
					console.log(config.freshErr + err);
					return;
				}
			}
		}
		//there is actually args
		else{
			//gets name
			var person = args[0];
			for (var i = 1; i < args.length; ++i) {
				person = person + " " + args[i];
			}
			//find the person's id
			var ret = await Process.findUserMention(person,message);
			//unsuccessful find
			if(ret == -2){
				message.channel.send(person + config.isntHere);
				return;
			}
			else if(ret == -1){
				message.channel.send(config.freshErr + config.findErr);
				return;
			}

			//no errors
			else{
				ret = ret.id;
				//get mention
				const personid = "<@" + ret + ">";
				//send tts messages
				try{
					message.channel.send(config.freshtts1 + personid + config.freshtts2, {
						tts: ttsBol
					});
					message.channel.send(config.freshtts3, {
						tts: ttsBol
					});
				}catch(err){
					console.log(config.freshErr + err);
					return;
				}
			}
			return;
		}
	},
	/* Process function: pacerTTS(args, message);
	* Description: send pacer tts
	* @param args: not used
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* 
	* return values: nothing
	* side effect: will send multiple messages for tts
	*/
	pacerTTS: async function(args, message){
		try{
			message.channel.send(copypasta.pacer1, {
						tts: true
					});
			message.channel.send(copypasta.pacer2, {
						tts: true
					});
			message.channel.send(copypasta.pacer3, {
						tts: true
					});
			message.channel.send(copypasta.pacer4, {
						tts: true
					});
		}catch(err){
			console.log(config.pacerErr + err);
			return;
		}
	},
	/* Process function: getonMention(args, message);
	* Description: tell user to get on
	* @param args: contain user arguments(just mentioned name to search)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: might call the wrong person if they have same
	* nickname
	*/
	getonMention: async function(args, message){
		if(args.length == 0 && autho.myServer){
			for(var i = 0; i < 5; ++i){
				//getfriend's id and spam
				message.channel.send("<@"+privateConst.chrisid+">" + " GET ON");
			}
			return;
		}
		else{
			//gets name
			var person = args[0];
			for (var i = 1; i < args.length; ++i) {
				person = person + " " + args[i];
			}
			length = 5;
			//find the person's id
			var ret = await Process.findUserMention(person,message);
			console.log("id: " +ret+" length: " +length);
			//not here
			if(ret == -2){
				message.channel.send(person + config.isntHere);
				return;
			}
			else if(ret == -1){
				message.channel.send(config.getonErr + config.findErr);
				return;
			}
			else{
				ret = ret.id;
				for(var i = 0; i < length; ++i){
				//getfriend's id and spam
					message.channel.send("<@"+ret+">" + " GET ON");
				}
				return;
			}
		}
	},
	/* Process function: iconSearch(args, message);
	* Description: get user mentioned args
	* @param args: contain user arguments(just mentioned name to search)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: if no args send the bot picture
	*/
	iconSearch: async function(args, message){
		if(typeof args[0] == 'undefined'){
			message.channel.send(privateConst.thoiconurl);
			return;
		}
		else{
			//gets name
			var person = args[0];
			for (var i = 1; i < args.length; ++i) {
				person = person + " " + args[i];
			}
			console.log(person);
			//find the mentioned person
			var ret = await Process.findUserMention(person,message);
			//console.log(ret);
			//not here
			if(ret == -2){
				message.channel.send(person + config.isntHere);
				return;
			}
			else if(ret == -1){
				message.channel.send(config.freshErr + config.findErr);
				return;
			}
			else{
				const iconurl = ret.user.avatarURL;
				message.channel.send(person + config.icon + iconurl);
				return;
			}
		}
	},
	/* Process function: playYT(args, message);
	* Description: call youtubeSearchApi and find first video
	* @param args: contain user arguments, song name
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: none
	*/
	playYT: async function(args, message){
		console.log("in play");
		///check if invalid options
		if(args.length == 0){
			message.channel.send(config.playErr);
			return;
		}
		//using the youtube api search

		var requestData = {
			part:"snippet",
			q: "",
			type:"video"
		}
		//create song name
		var song = "";
		for (var i = 0; i < args.length; ++i) {
			song += args[i] + " ";
		}
		//plug in the object to pass into api
		requestData.q = song;
		//try passing into api then send message
		//log error otherwise
		try{
			var returnVar = await youtubeSearch.searchVidByWords(requestData,auth.youtubeAPIKey);
			if(returnVar.data.items.length == 0){
				message.channel.send(config.noResult);
				return;
			}
			message.channel.send(config.nowPlaying +returnVar.data.items[0].snippet.title +config.nowPlaying2 + config.youtubeURL + returnVar.data.items[0].id.videoId);
		} catch(err){
			console.log("Playing Err: " +err);
			message.channel.send(config.thoBroke);
			return;
		}
	},
	/* Process function: respondsChris(args, message);
	* Description: responds if chris is mentioned
	* @param args: contain user arguments
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: only works on myserver
	*/
	respondsChris: function(args, message){
		//no args
		if(args.length == 0){
			message.channel.send("is cute" + config.cuteF);
		}
		//angery reacts
		else if(args[0] == "suck" || args[0] == "sucks"){
			message.channel.send(copypasta.navy);
		}
		return;
	},
	/* Process function: bigLetters(args, message);
	* Description: turn string into bigger letter emoji with regional indicator
	* @param args: contain user arguments (the string to convert)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: removes chars that are not alphanumeric or space
	*/
	bigLetters: function(args, message){
		//credit to neko bois for idea print out cool bic letter
		 var s2="";
		 //to convert to words so it can be turn into emoji
		 var numberWords = ["zero","one","two","three","four","five","six","seven","eight","nine"];
		 //first loop is for each words
		 //second loop is for each letters and add a space after each
		 //add big spacce to indicate real spacing
		 for(i=0;i<args.length;++i){
		 	for(j=0;j<args[i].length;++j){
		 		if(args[i][j].match(/[a-z]/i)) {
		 			s2+=":regional_indicator_"+args[i][j].toLowerCase()+": ";
		 		}
		 		else if(args[i][j].match(/[0-9]/i)){
		 			s2+=":"+numberWords[parseInt(args[i][j])]+": ";
		 		}
		 		else{
		 			s2+="      ";
		 		}
		 	}
		 	s2+= "      ";
		 }
		message.channel.send(s2);
	},
	/* Process function: connectFour(message);
	* Description: create or show connectfour board
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: none
	*/
	connectFour: async function(message){
		const connectFourGame = require('../connectFourGame/connectFourGame.js');
		try{
			await connectFourGame.connectFour(message);
		}catch(err){
			console.log(config.connectFourErr + err);
			return;
		}
		return;
	},
	/* Process function: resetConnectBoard(message);
	* Description: reset connectfour board.
	* @param args: contain user arguments (the string to convert)
	* 
	* return values: nothing
	* side effect: might not remove on certain conditions(see the connectFourGame.js)
	*/
	resetConnectBoard: async function(message){
		const connectFourGame = require('../connectFourGame/connectFourGame.js');
		try{
			await connectFourGame.Reset(message);
		}catch(err){
			console.log(config.c4ResetErr + err);
			return;
		}
		return;
	},
	/* Process function: connectFourMove(args, message);
	* Description: make a move in connectFour
	* @param args: contain user arguments (which position)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: none
	*/
	connectFourMove: async function(args, message){
		const connectFourGame = require('../connectFourGame/connectFourGame.js');
		try{
			await connectFourGame.Move(args, message);
		}catch(err){
			console.log(config.c4MoveErr + err);
			return;
		}
	},
	/* Process function: process2048(args, message);
	* Description: process 2048 arguments(either move/reset or create new)
	* @param args: contain user arguments (the string to convert)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: none
	*/
	process2048: async function(args,message){
		//no length
		if(args.length == 0){
			await poweroftwoBoard.createGame(message);
			return;
		}
		else{
			switch(args[0]){
				case "left":
				case "right":
				case "up":
				case "down":
					await poweroftwoBoard.move(args[0],message);
				break;		
				case "reset":
					await poweroftwoBoard.Reset(message);
					await poweroftwoBoard.createGame(message);
				break;
				default:
					await poweroftwoBoard.createGame(message);
				break;
			}
		}
	},
	/* Process function: getBeatmap(args, message);
	* Description: get random osu beatmap
	* @param args: contain user arguments (not yet implemented only works on empty args)
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: only call api every 5 bot requests first one do not count
	* so it spit out beat maps from the date
	*/
	getBeatmap: async function(args, message){
		var fs = require('fs');
		const channelid = message.channel.id;
		//get random dates
		if(args.length == 0){
			var randyear= getRandomInt(2008,2019);
			if(randyear == 2018){
				var today = new Date();
				var month = today.getMonth();
				var randmonth = getRandomInt(0,month+1);
				today = null;
				month = null;
			}
			else{
				var randmonth = getRandomInt(0,13);
			}
			//get random date to string
			var randday = getRandomInt(0,32);
			var date = randyear.toString() + "-" + randmonth.toString() + "-" +randday.toString();
			console.log(date);

			//option for api
			var options = {
				k: auth.osuApi,
				m: 0,
				since: date
			};
			console.log("jsoncount: " + osuJsonCount);

			//don't call api multiple time in a row
			if(osuJsonCount > 5 || osuJsonCount == -1){
				bmresp = await osuApi.getBeatmap(options);
				toPrint = null;
				bmresp = JSON.parse(bmresp);
				osuJsonCount = 0;
			}
			else{
				osuJsonCount++;
			}

			//random index to plug  in for random beatmap
			var rand = getRandomInt(0,500);
			console.log(bmresp[rand]);
			//get beatmap id and url
			var bmset_id = bmresp[rand].beatmapset_id;
			var msg = config.osuBMlink + bmset_id;
			message.channel.send(config.BMresp + msg);
			return;
		}
	},
	trackOsu: async function(args, message){
		//get file system and channel id
		var fs = require('fs');
		const channelid = message.channel.id;
		//get user id
		const discordid = message.author.id;
		//object for modes
		const modeobj = {
			"mode:osu": "0",
			"mode:taiko": "1",
			"mode:ctb": "2",
			"mode:mania":  "3"
		}
		//bring args togehter
		args = args.join(' ').toLowerCase();
		if(args.length == 0){
			message.channel.send(config.trackingUsage);
			return;
		}
		//check if user put in args
		let lowestI = 2001;
		let index = args.indexOf("mode:");
		var mode = "";
		if(index > -1){
			//10 because mania is biggest
			let tempS = args.substring(index, index+10);
			//send usage if error
			if(!modeobj[tempS]){
				message.channel.send(config.trackingUsage);
				return;
			}
			else{
				mode = modeobj[tempS];
			}
			lowerI = index;
		}
		else{
			mode = "0";
		}
		
		index = args.indexOf("pp:");
		var ppInt = 0;
		if(index > - 1){
			let tempS = args.substring(index+3, args.length);
			//parse in decimal pp number
			var tempInt = parseInt(tempS,  10);
			ppInt = tempInt;
			if(lowestI > index){
				lowestI = index;
			}
		}
		else{
			message.channel.send(config.trackingUsage);
			return;
		}

		index = args.indexOf("rank:");
		var rankInt = 0;
		if(index > -1){
			let tempS = args.substring(index+5, args.length);
			//parse in decimal pp number
			var tempInt = parseInt(tempS, 10);
			rankInt = tempInt;
			if(lowestI > index){
				lowestI = index;
			}
		}

		let username = args.substring(0,lowestI).trim();


		//try loading tracking object
		try{
			var contents = await fs.readFileSync(__dirname+ "/tracking/"  + 'tracker.json', 'utf8');
			if(contents[0] == undefined){
				try{
					var trackObj = {};
					await fs.writeFileSync(__dirname+ "/tracking/" +  'tracker.json', JSON.stringify(trackObj), 'utf8');
				} catch(err){
					console.log(err);
				}
			}
			else{
				var trackObj = JSON.parse(contents);
				console.log(trackObj)
			}
		} catch(err){
			console.log(err);
			var trackObj = {};
			await fs.writeFileSync(__dirname+ "/tracking/"  +'tracker.json', JSON.stringify(trackObj), 'utf8');
		}
		
		//log console and create option file for api
		console.log(config.trackAdd + username+ "/" + discordid);
		var option = {
			k: auth.osuApi,
			u: username,
			m: mode,
			type: "string"
		};
		//check if user exists
		let result = await osuApi.getUser(option);
		result = JSON.parse(result);
		console.log(result);
		if(result.length == 0){
			message.channel.send(config.trackfailed);
			return;
		}
		//check to see if user was tracked before
		if(!trackObj[username]){
			option.channels = [];
		}
		//console.log(option);
		//	console.log(discordid);
		//not saving auth key;
		delete option.k;
		option["pp"] = ppInt;
		option["rank"] = rankInt;
		//check if first time adding track for this user
		await option.channels.push(channelid);
		username = result[0].username;
		option["lastTime"] = "0";
		trackObj[username] = option;
		//console.log(option);
		console.log(trackObj);
		//write to disk
		try{
			await fs.writeFileSync(__dirname+ "/tracking/" + 'tracker.json', JSON.stringify(trackObj), 'binary');
		} catch(err){
			console.log(err);
			return;
		}
		message.channel.send(username + config.tracked);
	},
	lobby:  async function(args, message){
		const serverID = message.guild.id;
		if(serverID != privateConst.osuucsdid){return}
		if(args.length == 0 || args[0] == "standard" || args[0] == "std" || args[0] == "s"){
			message.member.addRole(privateConst.stdlobbyid).then(console.log(privateConst.stdlobbyid)).catch(console.error);
			message.channel.send("Hope to see you at our lobbies weekly!");
			return;
		}
		else if(args[0] == "m" || args[0] == "mania"){
			message.member.addRole(privateConst.manialobbyid).then(console.log(privateConst.manialobbyid)).catch(console.error);
			message.channel.send("Hope to see you at our lobbies weekly!");
			return;
		}
		else{
			message.channel.send("you're bad lol");
		}
	}
};


/**
 * checks if it is a banned message (only works on private server. Intended as a joke)
*/

async function checkBanWords(message, returnMessage){
	//get disk files
	let fs = require('fs');
	//get threshold
	let threshold = await fs.readFileSync(__dirname+'/ban/config.json', 'utf8');
	threshold = JSON.parse(threshold);
	//try loading tracking object
	try{
		var contents = await fs.readFileSync(__dirname+ "/ban/config.json", 'utf8');
		if(contents[0] == undefined){
			try{
				var trackObj = [];
				await fs.writeFileSync(__dirname+  "/ban/config.json", JSON.stringify(trackObj), 'utf8');
			} catch(err){
				console.log(err);
			}
		}
		else{
			var trackObj = JSON.parse(contents);
			//console.log(trackObj)
		}
	} catch(err){
		console.log(err);
		var trackObj = [];
		await fs.writeFileSync(__dirname+  "/ban/config.json", JSON.stringify(trackObj), 'utf8');
	}
	//TODO: turn into hash table for efficiency
	tempMess = message.content.toLowerCase();
	let ret = ["0",""];
	if(trackObj.truth == true){
			ret[1] = tempMess;
			tempMess = tempMess.replace(/ /g,'');
			for (var i = 0; i < trackObj.words.length; i++) {
				if(tempMess.indexOf(trackObj.words[i]) > config.reterror){
					ret[0] = 1;
					ret[1] = ret[1].replace(trackObj.words[i], "[REDACTED]");
					console.log(ret[1]);
			}
			
	}
	console.log(ret);
	return ret;
	}
}

async function deleteBanMessage(message,ret){
	try{
		let len = privateConst.randomJ.length;
		let usr = message.author.username;

		await message.delete(1000);
		await message.channel.send(privateConst.randomJ[getRandomInt(0, len)] + " <:KannaGun:360926434669363200>\n" 
			+ '```' + usr + " said: " + ret[1]  + '```');
	}
	catch(err){
		let len = privateConst.randomJ.length;
		await message.channel.send(privateConst.randomMod	+ "\n"
			 + privateConst.randomJ[getRandomInt(0, len)]);
	}

}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}