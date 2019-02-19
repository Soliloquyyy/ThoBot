//importing configs and const strings
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const privateConst = require("../private/privateConst.json");
const osuEvent = require("../osuApi/osuTrack.js");
const osuApi = require("../osuApi/osuApi.js");
//filesystem import
var fs = require('fs');
//data object to store
var data = {};
//osu event listener
const osuTrack = new osuEvent();
//listen to new track add
osuTrack.on('add', async function(){
	await readFiles();
});

module.exports.startTracking = async function(client){
	try{
		await readFiles();
	}catch(err){
		console.log(err);
		return;
	}
	while(true){
		await loopthrough();
}

async function readFiles(){
	//read dir
	try{
		data = await fs.readdirSync(__dirname+ "/tracking/tracker.json");
	}catch(err){
		console.log(err);
		return NULL;
	}
	return JSON.parse(data);
}

async function loopthrough(){
	return new Promise(resolve =>{
		Object.keys(data).forEach(async function(key){
			//only do every minute
			setTimeout(function() {
				console.log("waiting for next");
			}, 60000);
			let user = data[key];
			var pPoints = 0;
			var rank = 0;
			if(user["pp"]){
				pPoints = user["pp"];
			}
			if(user["rank"]){
				rank = user["rank"];
			}
			let option = {
				k: auth.osuApi,
				u: user.u,
				m: user.m,
				type: user.type,
				limit: 50
			};
			//call api to get recent
			let result = await osuApi.getRecent(options);
			result = JSON.parse(result);
			console.log(result);
			if(result.length == 0){
				console.log("error tracking timer restarting");
				resolve();
				return;
			}
			//loop until last played
			let i = 0;
			while(i < result.length && result[i].date != user.lastTime){
				result[i];
				++i;
			}
			if(!result[i]){
				user.lastTime = "0";
				return;
			}
			else{
				user.lastTime = result[i].date;
			}
			//rewrite with new time
			//might conflict with the readfile() event???
			try{
				await fs.writeFileSync(__dirname+ "/tracking/" + 'tracker.json', JSON.stringify(data), 'binary');
			}catch(err){
				console.log(err);
				return;
			}
			let occurance = new Array(51).join('0').split('').map(parseFloat);
			let lastRe = result[i];	
			let j = 0;
			//loop backward and get beatmaps
			for(i; i >= 0; --i){
				if(result == lastRe){
					occurance[j]++;
				}
				else{
					option.limit = occurance[j];
					let scores = osuApi.getScores(option);
					scores = JSON.parse(scores);
					let bestpp = await loopthroughScores(scores);
					if(bestpp["pp"] > pPoints){
						//send message
					}
					j++;
					occurance[j]++;
				}
			}
	});
	//resolve the promise
	resolve();
}

async function loopthroughScores(scores){
	let bestpp = score[0]["pp"];
	let i = 0;
	let ret = 0;
	for (var i = 1; i < scores.length; ++i) {
		let save = bestpp;
		bestpp = max(parseInt(bestpp), parseInt(scores[i]["pp"]);
		if(bestpp != save){
			ret = scores[i];
		}
	}
	return ret;
}