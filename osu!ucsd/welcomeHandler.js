/* welcomeHandler.js: This file is only for personal used
* this will welcome a person that just joined and assigned role
* if you would like to use this. please changed serverID
* channel, channel role id array of your desired choice
*
*/
//importing const
const config = require("../config/config.json");
const auth = require("../private/auth.json");
const privateConst = require("../private/privateConst.json");
const Discord = require("discord.js");

/* welcomeHandler async function: welcomeHandler(member, client));
* Description: ask for what school person belong to, and wait
* for their answer within 10 minutes.
* @param member: person just joined
* 
* return values: nothing
* side effect: will log messages for 10 minutes in memory.
*/
module.exports.welcomeHandler = async function(member){
	console.log("adding new member");
	const serverID = member.guild.id;
	//collects roleids
	
	if(serverID == privateConst.osuucsdid){
		console.log(member.guild.roles);
		try{
			//welcome new user
			member.guild.channels.get(privateConst.osuucsdChannel).send("<@"+member.id+"> " + privateConst.welcomeRole);
			/*
			//create message collector for their reply
			const collector = new Discord.MessageCollector(member.guild.channels.get(privateConst.osuucsdChannel), m => m.author.id === member.id, { time: 3000000 });
			//console.log(collector);
			collector.on('collect', message => {
				const msgStr = message.content.toLowerCase();
				const parseArr = privateConst.parseArr;
				const roleids = privateConst.roleids;
				for (i = 0; i < parseArr.length; ++i) {
					if(msgStr.indexOf(parseArr[i]) > -1){
						const roleid = roleids[i];
						message.member.addRole(roleid).then(console.log(roleid)).catch(console.error);
						message.channel.send(privateConst.beenRoled);
						collector.stop();
						return;
					}
				}
				
			});*/
		} catch(err){
			console.log(err);
			return;
		}

		return;
	}
	return;
}
