const Discord = require("discord.js");
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const copypasta = require("../config/copypasta.json");
const privateConst = require("../private/privateConst.json");
const request = require('request-promise');
const EventEmitter = require('events');
const reddit = "https://www.reddit.com/r/"


class subredditEmitter extends EventEmitter{}
const subredditListener = new subredditEmitter;
var client;
//setinterval can be change in json
module.exports.setupReddit = async function(id){
	client = id;
	intervalLoop();
}

async function intervalLoop(){
		console.log("emitting subreddit event");
		let fs = require('fs');
		let time = await fs.readFileSync(__dirname+'/interval.json', 'utf8');
		time = JSON.parse(time);
		console.log(time);
		subredditListener.emit("track");
		await setTimeout(intervalLoop, time.length);
}


//listen to event every interval
subredditListener.on('track', function(){
	getMessage();
});

async function getMessage(){
	//parse json
	//let subs = require("./subreddits.json");
	let fs = require('fs');
	let subs = await fs.readFileSync(__dirname+'/subreddits.json', 'utf8');
	subs = JSON.parse(subs);
	console.log(subs);
	for (const channelID of Object.keys(subs)){
		//get url from calling request
		for(let j = 0; j < subs[channelID].length; ++j){
			ret = await getSub(subs[channelID][j], channelID, j);
			if(ret){
				for(let i = 0; i < ret.img.length; ++i){
					const embed = new Discord.RichEmbed();
					embed.setTitle(ret.title[i]);
					embed.setAuthor('subreddit: ' + subs[channelID][j],'https://i.imgur.com/zNrZxeX.jpg');
					embed.setURL(ret.links[i]);
					let randhex = '0x'+(Math.random()*0xFFFFFF<<0).toString(16);
					embed.setColor(randhex);
					embed.setImage(ret.img[i]);
					var dt = new Date(0);
					dt.setUTCSeconds(ret.date[i])
					embed.setTimestamp(dt);
					embed.setDescription("Scores: " + ret.ups[i]);
					await client.channels.get(channelID).send({embed});
				}
			}
		}
	}
}


//helper function
async function getSub(name, channelID, index){
	let ret = {
		"img": [],
		"title": [],
		"links": [],
		"ups": [],
		"date": []
	};
	//calling request to get json of reddit
	try{
		var result = await request(reddit+name+".json");
	}
	catch (err){
		console.log(err);
		return "";
	}
	//get disk files
	let fs = require('fs');
	//get threshold
	let threshold = await fs.readFileSync(__dirname+'/threshold.json', 'utf8');
	threshold = JSON.parse(threshold);
	//try loading tracking object
	try{
		var contents = await fs.readFileSync(__dirname+ "/tracking/"  + channelID +'.json', 'utf8');
		if(contents[0] == undefined){
			try{
				var trackObj = [];
				await fs.writeFileSync(__dirname+ "/tracking/" + channelID +'.json', JSON.stringify(trackObj), 'utf8');
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
		await fs.writeFileSync(__dirname+ "/tracking/" + channelID +'.json', JSON.stringify(trackObj), 'utf8');
	}
	result = JSON.parse(result);
	for (var i = 0; i < result.data.children.length; ++i) {
		let temp = result.data.children[i].data;
		if(temp.ups > threshold[channelID][index]){
			//if already has
			if(trackObj.indexOf(temp.url) <= -1){
				//push new url into
				ret.img.push(temp.url);
				ret.title.push(temp.title);
				ret.links.push('https://www.reddit.com'+temp.permalink);
				ret.ups.push(temp.ups);
				ret.date.push(temp.created_utc);
				trackObj.push(temp.url);
			}

		}
	}
	console.log(trackObj);
	//write to disk
	try{
		await fs.writeFileSync(__dirname+ "/tracking/" + channelID +'.json', JSON.stringify(trackObj), 'binary');
	} catch(err){
		console.log(err);
	}
	return ret;
}