/* Board.js: This file is for 2048 game logic
*
*/
const config = require("../config/config.json");
const auth = require("../private/auth.json");

/* 2048Board async function: createGame(message));
* Description: starts a 2048 game on the channel
* @param message: the object contains OP message properties
*
* return values: nothing
* side effect: split out error when no files/folder are there
* please makesure folder(games) is there and file will just create itself
*/
module.exports.createGame = async function(message){
	//get channel id and config files
	var channelid = message.channel.id;
	//filesystem nodejs api
	var fs = require('fs');

	//async read or write
	try{
		var contents = await fs.readFileSync(__dirname+ "/games/"  + channelid + '.json', 'utf8');
		if(contents[0] == undefined){
			try{
				var board = await creatBoardObject();
				await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(board), 'binary');
			} catch(err){
				console.log(err);
			}
		}
	} catch(err){
		console.log(err);
		var board = await creatBoardObject();
		await fs.writeFileSync(__dirname+ "/games/"  + channelid + '.json', JSON.stringify(board), 'binary');
	}

	//get that object to print out 
	contents = fs.readFileSync(__dirname+ "/games/"  + channelid + '.json', 'utf8');
	console.log(contents);
	contents = JSON.parse(contents);

	//actually send message
	await sendBoard(contents,message,false);
	return;
}


/* 2048Board async function: move(direction, message));
* Description: starts a 2048 game on the channel
* @param direction: the direction for which the board to move
* @param message: the object contains OP message properties
*
* return values: nothing
* side effect: will do nothing if moving in bad direction.
* also deletes user command message after 5 sec
*/
module.exports.move = async function(direction, message){
		var channelid = message.channel.id;
		//check if game started
		var fs = require('fs');
		try{
			var contents = await fs.readFileSync(__dirname+ "/games/"  + channelid + '.json', 'utf8');
			contents = JSON.parse(contents);
		}catch(err){
			console.log(err);
			message.channel.send(config.game2048NotStart);
			return;
		}
		var saved = JSON.parse(JSON.stringify(contents));;
		switch(direction){
			case "left":
				//loop to and move first
				for(column = 0; column < 4; ++column){
					for(row = 0; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true){
								//if i is too large
								if(column+i >= 4){
									break;
								}
								//keep checking if see 0
								if(contents.arrays[row][column+i] == 0){
									i++;
									continue;
								}
								//if not 0 check if equal then move
								if(contents.arrays[row][column] == contents.arrays[row][column+i]){
									contents.arrays[row][column] *= 2;
									contents.arrays[row][column+i] = 0;
									break;
								}
								//if not equal then break
								else{
									break;
								}
							}
						}
					}
				}
				//loop again and move over empty space
				for(column = 1; column < 4; ++column){
					for(row = 0; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true) {
								if(column-i < 0){
									break;
								}
								if(contents.arrays[row][column-i] == 0){
									console.log(contents.arrays[row][column-i]);
									contents.arrays[row][column-i] = contents.arrays[row][column-i+1];
									contents.arrays[row][column-i+1] = 0;
									i++;
								}
								else{
									i++;
								}
							}
						}
					}
				}
				if(!(JSON.stringify(saved) === JSON.stringify(contents))){
					contents = await generateTiles(contents);
				}
				try{
					await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(contents), 'binary');
				}catch(err){
					console.log(err);
					return;
				}
				await sendBoard(contents, message);
			break;
			case "right":
				//loop to and move first
				for(column = 3; column >= 0; --column){
					for(row = 0; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true){
								//if i is too large
								if(column-i < 0){
									break;
								}
								//keep checking if see 0
								if(contents.arrays[row][column-i] == 0){
									i++;
									continue;
								}
								//if not 0 check if equal then move
								if(contents.arrays[row][column] == contents.arrays[row][column-i]){
									contents.arrays[row][column] *= 2;
									contents.arrays[row][column-i] = 0;
									break;
								}
								//if not equal then break
								else{
									break;
								}
							}
						}
					}
				}
				//loop again and move over empty space
				for(column = 2; column >= 0; --column){
					for(row = 0; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true) {
								if(column+i > 3){
									break;
								}
								if(contents.arrays[row][column+i] == 0){
									contents.arrays[row][column+i] = contents.arrays[row][column+i-1];
									contents.arrays[row][column+i-1] = 0;
									i++;
								}
								else{
									i++;
								}
							}
						}
					}
				}
				if(!(JSON.stringify(saved) === JSON.stringify(contents))){
					contents = await generateTiles(contents);
				}
				try{
					await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(contents), 'binary');
				}catch(err){
					console.log(err);
					return;
				}
				await sendBoard(contents, message);
			break;
			case "up":
				//loop to and move first
				for(column = 0; column < 4; ++column){
					for(row = 0; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true){
								//if i is too large
								if(row+i >= 4){
									break;
								}
								//keep checking if see 0
								if(contents.arrays[row+i][column] == 0){
									i++;
									continue;
								}
								//if not 0 check if equal then move
								if(contents.arrays[row][column] == contents.arrays[row+i][column]){
									contents.arrays[row][column] *= 2;
									contents.arrays[row+i][column] = 0;
									break;
								}
								//if not equal then break
								else{
									break;
								}
							}
						}
					}
				}
				//loop again and move over empty space
				for(column = 0; column < 4; ++column){
					for(row = 1; row < 4; ++row){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true) {
								if(row-i < 0){
									break;
								}
								if(contents.arrays[row-i][column] == 0){
									console.log(contents.arrays[row][column-i]);
									contents.arrays[row-i][column] = contents.arrays[row-i+1][column];
									contents.arrays[row-i+1][column] = 0;
									i++;
								}
								else{
									i++;
								}
							}
						}
					}
				}
				if(!(JSON.stringify(saved) === JSON.stringify(contents))){
					contents = await generateTiles(contents);
				}
				try{
					await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(contents), 'binary');
				}catch(err){
					console.log(err);
					return;
				}
				await sendBoard(contents, message);
			break;
			case "down":
				//loop to and move first
				for(row = 3; row >= 0; --row){
					for(column = 0; column < 4; ++column){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true){
								//if i is too large
								if(row-i < 0){
									break;
								}
								//keep checking if see 0
								if(contents.arrays[row-i][column] == 0){
									i++;
									continue;
								}
								//if not 0 check if equal then move
								if(contents.arrays[row][column] == contents.arrays[row-i][column]){
									contents.arrays[row][column] *= 2;
									contents.arrays[row-i][column] = 0;
									break;
								}
								//if not equal then break
								else{
									break;
								}
							}
						}
					}
				}
				//loop again and move over empty space
				for(row = 2; row >= 0; --row){
					for(column = 0; column < 4; ++column){
						if(contents.arrays[row][column] != 0){
							var i = 1;
							while(true) {
								if(row+i > 3){
									break;
								}
								if(contents.arrays[row+i][column] == 0){
									contents.arrays[row+i][column] = contents.arrays[row+i-1][column];
									contents.arrays[row+i-1][column] = 0;
									i++;
								}
								else{
									i++;
								}
							}
						}
					}
				}
				if(!(JSON.stringify(saved) === JSON.stringify(contents))){
					contents = await generateTiles(contents);
				}
				try{
					await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(contents), 'binary');
				}catch(err){
					console.log(err);
					return;
				}
				await sendBoard(contents, message);
			break;
		}
}

/* 2048Board async function: Reset(message));
* Description: reset board if user has manage message power
* @param message: the object contains OP message properties
*
* return values: nothing
* side effect: nothing
*/
module.exports.Reset = async function(message){
	//nodefilesystem
	var fs = require('fs');


	//get roles and channels
	let rolearray = await message.member.roles.array();
	console.log(rolearray);
	let channelid = message.channel.id;

	//loop the person role to see if they have admin role then reset if not return error
	for(i=0;i < rolearray.length; ++i){
		if(rolearray[i].hasPermission('MANAGE_MESSAGES')){
			try{
				var board = await creatBoardObject();
				await fs.writeFileSync(__dirname+ "/games/" + channelid + '.json', JSON.stringify(board), 'binary');
			} catch(err){
				console.log(err);
				message.channel.send(config.leakedErr);
				return;
			}
			message.channel.send(config.game2048reset);
			return;
		}
	}
	message.channel.send(config.game2048badreset);
	return;

}

/* 2048Board async function: deleteprevMessage(message [,truth]));
* Description: delete prev message
* @param message: the object contains OP message properties
* @param truth: (optional) whether or not to delete message.
* if not passed in it will delete the original message.
*
* return values: nothing
* side effect: will log messages in memory to determine the previous message 
*/
async function deleteprevMessage(message,truth){
	//deleting previous board
	var messages = await message.channel.fetchMessages({limit:20}).then(messages => {
     	const botMessages = messages.filter(msg => msg.author.id === "473650641844043806");
     	var arr = botMessages.array();
     	for(i = 0; i < arr.length; ++i){
     		if(arr[i].content.startsWith("`")){
     			arr[i].delete().then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);
     			break;
     		}
     	}
    }).catch(err => {
    	console.log(err);
		return;
	});
	if(truth == undefined){
		message.delete(5000);
	}
	return;
}

/* 2048Board function: generateTiles(board));
* Description: create the random tile after a move
* @param board: the 2d array respresenting the board
*
* return values: nothing
* side effect: will probably error if not 2D array
*/
function generateTiles(board){
	var randStartingInt = getRandomInt(1);
	var j = getRandomInt(4);
	var k = getRandomInt(4);
	//loop until find empty 0
	while(board.arrays[j][k] != 0){
		j = getRandomInt(4);
		k = getRandomInt(4);
	}
		board.arrays[j][k] = 2;
	return board;
}

//get random int funcition with max range
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* 2048Board function: sendBoard(contents, message [, truth]));
* Description: send board back to user
* @param board: the 2d array respresenting the board
* @param message: OP message object that contains everything about
* that message properties
* @param truth: (optional) whether or not to delete the message
* (delete without truth value)
*
* return values: nothing
* side effect: might delete previous message
*/
async function sendBoard(contents, message, truth){
	await deleteprevMessage(message,truth);
	var tempS = "2048\n";
	for(column = 0; column< 4; ++column){
		for(row = 0; row < 4; ++row){
			tempS += "`" + contents.arrays[column][row] + "`    ";
		}
		tempS += "\n";
	}
	console.log(tempS);
	message.channel.send(tempS).then().catch(console.err);
	return;
}

/* 2048Board function: createBoardObject();
* Description: create a new board with 2 or 4 randomly
* on two tiles.
*
* return values: nothing
* side effect: none
*/
function creatBoardObject(){
	var board = {
		"arrays": [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ],
	}
	//generate random number from the start and randomly put into board
	var randStartingInt = [getRandomInt(1),getRandomInt(1)]
	for (var i = 0; i < randStartingInt.length; ++i) {
		if(randStartingInt[i] == 0){
			var j = getRandomInt(4);
			var k = getRandomInt(4);
			//loop until find empty 0
			while(board.arrays[j][k] != 0){
				j = getRandomInt(4);
				k = getRandomInt(4);
			}
			board.arrays[j][k] = 2;
		}
		else{
			var j = getRandomInt(4);
			var k = getRandomInt(4);
			//loop until find empty 0
			while(board.arrays[j][k] != 0){
				j = getRandomInt(4);
				k = getRandomInt(4);
			}
			board.arrays[j][k] = 4;
		}
	}
	return board;

}