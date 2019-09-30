const config = require("../config/config.json");
const auth = require("../private/auth.json");
const privateConst = require("../private/privateConst.json");
const Discord = require("discord.js");

module.exports.roleHandler = async function(message){
	console.log("role handling");

	const msgStr = message.content.toLowerCase();
	const parseArr = privateConst.parseArr;
	const roleids = privateConst.roleids;

	for (i = 0; i < parseArr.length; ++i) {
		//if its in the dict
		if(msgStr.indexOf(parseArr[i]) > -1){
			const roleid = roleids[i];
			message.member.addRole(roleid).then(console.log(roleid)).catch(console.error);
			//message.channel.send(message.author + privateConst.beenRoled);
			message.guild.channels.get(privateConst.osuucsdGeneral).send(message.author + privateConst.beenRoled);
		}
	}


}
