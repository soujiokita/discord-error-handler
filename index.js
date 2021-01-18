//const mongoose = require("mongoose");
const serverset = require("./models/schema.js");
const Discord = require("Discord.js")
class handling {

  /**
  * @param {string} [dbUrl] - A valid mongo database URI.
  */

  static async setURL(dbUrl) {
    if (!dbUrl) throw new TypeError("A database url was not provided.");
    
    return mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  /**
  * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
  * @param {string} [guildId] - Discord guild id.
  * @param {string} [msg] - the messsage which caused the error
  * @param {string} [errorr] - the error
  */

  static async createrr(client, guildId, msg, errorr) {
    if (!client) throw new TypeError("An client was not provided.");
    if (!errorr) throw new TypeError("An errorr was not provided.");
    const clean = text => {// is afunction
      text = String(text);//strings the function
      let searched = text.split('\n');//splits by /n
      return searched[0];// returns the splited array
  }
  let cleaned = clean(errorr);
        if (client.error.has(cleaned)){
        client.error.set(cleaned, { ///this saves the error in a map, to prevent multipy errors
        guildid: guildId,
        msg: msg, 
        error: cleaned , 
        count: client.error.get(cleaned).count +1,
        date: Date.now(),
        msgid: client.error.get(cleaned).msgid
      });
     
    }else{
      if(client.error.has("allerrors")){
        let allerrors = client.error.get("allerrors").allerrors
        allerrors.push(cleaned)
      client.error.set("allerrors", {
      allerrors: allerrors,
      })
    }else{
      client.error.set("allerrors", {
        allerrors: [cleaned],
        })
   }

    let log = new  Discord.MessageEmbed();
    log.setTitle("New Error Entcounterd!")
    if(msg){
    log.addField(`On message in ${guildId}:` ,"```" +  msg +"```")
    }
    log.addField("Error", "```" + cleaned +"```" )
    log.setColor("RED")
    log.setTimestamp();
    let servermessage;
    if(client.shard){
    servermessage = await client.shard.broadcastEval(`this.channels.cache.has("${client.logchannel[1]}") ? this.channels.cache.get("${client.logchannel[1]}").send({
        embed: ${JSON.stringify(log.toJSON())}}) : null`).catch(err => console.error(err))
    }else{
     let channel = await client.channels.cache.get(client.logchannel[1]);
      servermessage = await channel.send({embed: log}).catch(err => console.error(err))
    }
    client.error.set(cleaned, { ///this saves the msgid in a map to prevent a fetch
        guildid: guildId,
        msg: msg, 
        error: cleaned, 
        count: 1,
        date: Date.now(),
        msgid: servermessage.id
      });
    }
    return;
  }
  /**
  * @param {object} [message] - Discord message parameter to send the message;
  * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
  */
   static async report(client,message) {
  if (!message || !client) throw new TypeError("A client or message was not provided.");
  let allerror = [];
  let count = 0;
  let i;
  if(client.error.has("allerrors")){
    
  for(i = 0; i < client.error.get("allerrors").allerrors.length ; i++){
    let errorr = client.error.get(client.error.get("allerrors").allerrors[i])
    allerror.push(`**[${errorr.error}](https://discord.com/channels/${client.logchannel[0]}/${client.logchannel[1]}/${errorr.msgid})** - **${errorr.count} **`)
    count = count + errorr.count;
  }
  }
  if(!allerror[0]) allerror.push("No Errors have been found!");
  let report = new Discord.MessageEmbed();
  report.setTitle("Error Message - Count");
  report.setDescription("```" + i + " Errors happend " + count +" times" + "```\n" + allerror.join("\n"));
  report.setFooter("Requested by: " + message.author.tag , message.author.displayAvatarURL());
  report.setTimestamp();
  report.setColor("YELLOW");
  message.channel.send({embed :report});
  return;
}

}

module.exports = handling;
