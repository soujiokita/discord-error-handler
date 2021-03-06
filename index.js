const mongoose = require("mongoose");
const serverset = require("./models/schema.js");
const Discord = require("discord.js-light")
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
        stack: error.stack,
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
    log.addField("Error", "```" + smaller(cleaned ,200)+"\n" + smaller(error.stack,800 ) +"```" )
    log.setColor("RED")
    log.setTimestamp();
    let servermessage;
    if(client.shard){
    servermessage = await client.channels.forge(client.logchannel[1]).send({embed: log})  /// u need discord js light 
    }else{
     let channel = await client.channels.cache.get(client.logchannel[1]);
      servermessage = await channel.send({embed: log}).catch(err => console.error(err))
    }
    console.log(error)
    client.error.set(cleaned, { ///this saves the msgid in a map to prevent a fetch
        guildid: guildId,
        msg: msg, 
        error: cleaned, 
        count: 1,
        stack: error.stack,
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
    try{
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
  message.channel.send({embed: report});
  return;
}catch(error){
  console.log(error);
}
}
  /**
  * @param {object} [message] - Discord message parameter to send the message;
  * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
  */
   static async status(client,message) {
    if (!message || !client) throw new TypeError("A client or message was not provided.");
    if(!client.shard) return console.log("This funtion is currenlty just availble for Sharding, commit to have it for normal bots")
    let eachstatus = [];
    async function cpuUsageCompact(time) {
    let start = [process.hrtime(),process.cpuUsage()];
    await new Promise(r => setTimeout(r,time));
    let elap = [process.hrtime(start[0]),process.cpuUsage(start[1])];
    return 100 * (elap[1].user / 1000 + elap[1].system / 1000) / (elap[0][0] * 1000 + elap[0][1] / 1000000);
    }
    let forcpu = await client.shard.broadcastEval(`${await cpuUsageCompact(100)}`)
    let forram = await client.shard.broadcastEval(`(process.memoryUsage().rss / 1024 / 1024)`)
    let forping =  await client.shard.broadcastEval(`(this.ws.ping)`)
    let forstatus = [];
    for(let i = 0 ; i < client.shard.count; i++){
    if(forping[i]) {forstatus[i] =  "🟢"}; 
    eachstatus.push(`${await (forstatus[i] || "🔴") } Shard ${i} | ${await forping[i]} ms | ${await forcpu[i].toFixed(0)}% | ${await forram[i].toFixed(0)} (MB) `);
    } 
  
      let status = new Discord.MessageEmbed();
      status.addField("Shard Name       |      Ping    |    CPU    |    Ram " ,"```" + eachstatus.join("\n") +"```")
      status.setFooter("Requested by: " + message.author.tag , message.author.displayAvatarURL());
      status.setTimestamp();
      status.setColor("YELLOW");
      message.channel.send({embed: status})
      /*
    let forcpu = await client.shard.broadcastEval(`if(this.shard.ids.includes(${i})){process.cpuUsage()}`)
    let fortime = await client.shard.broadcastEval(`if(this.shard.ids.includes(${i})){ process.hrtime()}`)
    let elapsedCPU = await client.shard.broadcastEval(`if(this.shard.ids.includes(${i})){process.cpuUsage(${forcpu[0]})}`)
    let elapsedTime = await client.shard.broadcastEval(`if(this.shard.ids.includes(${i})){ process.hrtime(${fortime[0]})}`)
    console.log(elapsedCPU);
    console.log(elapsedTime);
    
    let milliseconds = elapsedTime[0][0] * 1000 + elapsedTime[0][1] / 1000000;
    let timings = elapsedCPU[0].user / 1000 + elapsedCPU[0].system / 1000;
    let percentage = 100 * timings / milliseconds;*/
  }

}

module.exports = handling;
function smaller(string, limit){
  if(string.length <= limit){
    return string;
  }
  return string.slice(0,limit) + '...';
}