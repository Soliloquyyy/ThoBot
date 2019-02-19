
/* connectFourGame.js: this is the logic behind connectfour game and
* how games is stored
* right now it is very inefficient as when I was writing this
* I forgot u can just straight store objects
* This will probably be rewritten in the near future
*
*/
//consts
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const privateConst = require("../private/privateConst.json");

/* connectFourGame async function: connectFour( message);
	* Description: established connnect four game if not started
	* or just print out the game
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: will logs errors when no files exists
	* but rest assure it will auto create file if that happens
	*/
module.exports.connectFour = async function(message){
	//get channel id and config files
	var channelid = message.channel.id;
	const boardlen = 931;

	//filesystem nodejs api
	var fs = require('fs');

	//async read or write
	try{
		var contents = await fs.readFileSync(__dirname+ "/games/"  + channelid + '.txt', 'utf8');
		if(contents[0] == undefined){
			try{
				await fs.writeFileSync(__dirname+ "/games/" + channelid + '.txt', '\n' + config.grid);
			} catch(err){
				console.log(err);
			}
		}
	} catch(err){
		console.log(err);
		await fs.writeFileSync(__dirname+ "/games/"  + channelid + '.txt', '\n' + config.grid);
	}

	//syncing read
	console.log("timing out");
	contents = fs.readFileSync(__dirname+ "/games/"  + channelid + '.txt', 'utf8');
	//check substring;
	var index = 0;
	//get string to display
	var tempS = "";

	//f for fill bits inefficient but will fix later update(?)
	for(i = 0; i < boardlen; ++i){
		if(contents[index] === 'f'){
			break;
		}
		tempS += contents[index];
		index++;
	}
	console.log(tempS);
	//display
	message.channel.send(tempS);

	return;
};

/* connectFourGame async function: Reset(message);
	* Description: reset game current state if the person has manage message
	* power
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: will logs errors when no files exists
	* but rest assure it will auto create file if that happens
	*/
module.exports.Reset = async function(message){
	//get roles and channels
	let rolearray = await message.member.roles.array();
	console.log(rolearray);
	let channelid = message.channel.id;
	//nodefilesystem
	var fs = require('fs');
	//loop the person role to see if they have admin role then reset if not return error
	for(i=0;i < rolearray.length; ++i){
		if(rolearray[i].hasPermission('MANAGE_MESSAGES')){
			try{
				await fs.writeFileSync(__dirname+ "/games/connectfour/"  + channelid + '.txt', "");
			} catch(err){
				console.log(err);
				message.channel.send(config.leakedErr);
				return;
			}
			message.channel.send(config.c4ResetSucc);
			return;
		}
	}
	message.channel.send(config.c4NotAdmin);
	return;
};


/* connectFourGame async function: Move(command,message);
	* Description: make a move for a player
	* @param message: the OP message object that contains details 
	* about the message
	* 
	* return values: nothing
	* side effect: will reset game if wonned
	*/
//TODO: clean up this function
module.exports.Move = async function(command,message){
	//get channel id and config files
	var channelid = message.channel.id;
	const boardlen = 931;

	//filesystem nodejs api
	var fs = require('fs');

	//async read
	try{
		var contents = await fs.readFileSync(__dirname+ "/games/" + channelid + '.txt', 'utf8');
	} catch(err){
		console.log(err);
		message.channel.send("game in this channel have not been started! owo! try(without <>) <tho connectfour>");
		return;
	}

	//check substring;
	var index = contents.indexOf("\n");

	//append channel to file if not created
	if(index <= -1){
		message.channel.send("game in this channel have not been started! owo! try(without <>) <tho connectfour>");
		return;
	}

	var playerid = await parseInt(contents[931]);
	var writeName = 0;
	//try getting player's id
		if(playerid == 1){
			var playerIndex = contents.indexOf("<");
			if(playerIndex <= -1){
				var player = message.author.id;
				writeName = 1;
			}
			else{
				var splitIndex = contents.indexOf("&");
				var player = contents.substring(playerIndex+1, splitIndex);
			}
		}
		else{
			var playerIndex = contents.indexOf("&");
			if(playerIndex <= -1){
				var tempI = contents.indexOf("<");
				if( tempI > - 1){
					var tempPlayer = contents.substring(tempI+1, contents.length);
					var player = message.author.id;
					if(tempPlayer == player){
						message.channel.send("Sorry owo! It is not your turn yet! Please let player 2 join! :rage:");
						return;
					}
					else{
						writeName = 2;
					}
				}
			}
			else{
				var splitIndex = contents.indexOf(">");
				var player = contents.substring(playerIndex+1, splitIndex);
			}
		}
	if(message.author.id != player){
		message.channel.send("Sorry owo! It is not your turn yet! it's " + "<@" +player+ ">" + "'s");
		return;
	}

	//index offset
	index = 0;
	var tempS = "";
	for(i = 0; i < boardlen; ++i){
			if(contents[index] === 'f'){
				break;
			}
			tempS += contents[index];
			index++;
	}

	//deleting previous board
	var messages = await message.channel.fetchMessages({limit:20}).then(messages => {
     	const botMessages = messages.filter(msg => msg.author.id === "473650641844043806");
     	var arr = botMessages.array();

     	for(i = 0; i < arr.length; ++i){
     		if(arr[i].content.startsWith(":")){
     			arr[i].delete().then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);
     			break;
     		}
     	}
    }).catch(err => {
    	console.log(err);
		return;
	});

	//turns into 2d array
	var gameArr = [];
	gameArr = await tempS.split('\n');
	gameArr = await gameArr.map((value)=> value.split(' '));
	console.log(gameArr);
	//	console.log(gameArr[1][0]);
	//get index for the array
	var arrayInd = (await parseInt(command)) - 1;

	//find next avail square and place circle
	var placed = 0;
	for(i=6;i >= 0; --i){
		if(gameArr[i][arrayInd] === ":black_square_button:"){
			if(playerid == 1){
				gameArr[i][arrayInd] = ":red_circle:";
			}
			else{
				gameArr[i][arrayInd] = ":large_blue_circle:";
			}
			placed = 1;
			break;
		}
	}

	//check game winning condition
	var condition = await checkGcondition(gameArr);

	//	console.log(gameArr[0][0]);
	
	//turn array back into a single string
	tempS = "\n";
	for(i=1; i < 7; ++i){
		for(j=0; j < 7; ++j){
			tempS += gameArr[i][j] + ' ';
		}
		tempS += '\n';
	}

	message.channel.send(tempS);

	//if game over reset and return
	if(condition == ":red_circle:" || condition == ":large_blue_circle:"){
		message.channel.send( "<@" + message.author.id + ">" + " won the game!!! OWO <3");
		tempS = "";
		try{
			await fs.writeFileSync(__dirname+"/games/" + channelid + '.txt', tempS);
		} catch(err){
			message.channel.send("y-y-yikes please tell my master that u leaked me T_T");
			return;
		}
		return;
	}

	while(tempS.length != boardlen){
		tempS += 'f';
	}
	//switch color
	if(playerid == 1){
		tempS += '2';
	}
	else{
		tempS += '1';	
	}
	if(writeName == 0){
		tempS += contents.substring(contents.indexOf("<"),contents.indexOf(">")+1);
	}
	else if(writeName == 1){
		tempS += "<"+player;
	}
	else{
		tempS += contents.substring(contents.indexOf("<"),contents.length);
		tempS += "&"+player+">";
	}

	console.log(tempS);
	//if piece has been placed then we rewrite data
	if(placed){
		try{
			await fs.writeFileSync(__dirname+ "/games/" + channelid + '.txt', tempS);
		} catch(err){
			message.channel.send("y-y-yikes please tell my master that u leaked me T_T");
			return;
		}
	}
	message.delete(5000);
	return;
};


/* connectFourGame  function: checkCondition(gameArr);
	* Description: loop through 2d array and check if at winning position
	* @param gameArr: the game 2d Array
	* 
	* return values: nothing
	* side effect: will crash if array is less than 2D.
	*/
function checkGcondition(gameArr){
	//vertical
	for(row = 1; row < 4; ++row){
		for(col = 0; col < 7; ++col){
			if(gameArr[row][col] != ":black_square_button:" && 
				gameArr[row][col] == gameArr[row+1][col] &&
					gameArr[row][col] == gameArr[row+2][col] &&
						gameArr[row][col] == gameArr[row+3][col]){
							return gameArr[row][col];
			}
		}
	}

	//horizontal
	for(row = 1; row < 7; ++row){
		for(col = 0; col < 4; ++col){
			if(gameArr[row][col] != ":black_square_button:" && 
				gameArr[row][col] == gameArr[row][col+1] &&
					gameArr[row][col] == gameArr[row][col+2] &&
						gameArr[row][col] == gameArr[row][col+3]){
							return gameArr[row][col];
			}
		}
	}
	//diagonally
	for(row = 1; row < 4; ++row){
		for(col = 0; col < 4; ++col){
			if(gameArr[row][col] != ":black_square_button:" && 
				gameArr[row][col] == gameArr[row+1][col+1] &&
					gameArr[row][col] == gameArr[row+2][col+2] &&
						gameArr[row][col] == gameArr[row+3][col+3]){
							return gameArr[row][col];
			}
		}
	}
	for(row = 4; row < 7; ++row){
		for(col = 0; col < 4; ++col){
			if(gameArr[row][col] != ":black_square_button:" && 
				gameArr[row][col] == gameArr[row-1][col+1] &&
					gameArr[row][col] == gameArr[row-2][col+2] &&
						gameArr[row][col] == gameArr[row-3][col+3]){
							return gameArr[row][col];
			}
		}
	}


	//else nothing
	return ":black_square_button:";
}
