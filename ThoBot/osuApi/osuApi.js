/* osuAPi.js: This file is for osu api requests
*
*/

//constants required
const request = require('request-promise');
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const querystring = require('querystring');

/* osuApi async function: getBeatmap(option));
* Description: search using the option and key passed in
* @param options: the option for requesting the data(object).
* please visit osu API for more information about this object
*
* return values: nothing
* side effect: nothing
*/
module.exports.getBeatmap = async function(options){
	//serialized our strings 
	var serialized = querystring.stringify(options);
	//get URL with serialized
	var apiUrl = config.osuApiBM + serialized;
//	console.log(apiUrl);
	try{
		//call API with serialized url
		result = await request(apiUrl);
		return result;
	} catch(err){
		console.log(err);
		return;
	}

}

module.exports.getRecent = async function(options){
	//serialized our strings 
	var serialized = querystring.stringify(options);
	//get URL with serialized
	var apiUrl = config.osuApiRecent + serialized;
//	console.log(apiUrl);
	try{
		result = await request(apiUrl);
		return result;
	} catch(err){
		console.log(err);
		return NULL;
	}
}


module.exports.getUser = async function(options){
	//serialized our strings 
	var serialized = querystring.stringify(options);
	//get URL with serialized
	var apiUrl = config.osuApiGetUser + serialized;
	//console.log(apiUrl);
	try{
		result = await request(apiUrl);
		return result;
	} catch(err){
		console.log(err);
		return NULL;
	}
}