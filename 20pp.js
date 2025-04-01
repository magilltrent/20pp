const { Client, GatewayIntentBits } = require('discord.js');
const AWS = require('aws-sdk');
require('dotenv').config();

const discordToken = process.env.DISCORD_TOKEN;
const awsKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;

console.log(awsKey)

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: awsKey,
    secretAccessKey: awsSecret
});

const ec2 = new AWS.EC2();

const discordClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const setBotStatus = (something) => {
    discordClient.user.setPresence({
        status: 'online',
        activities: [
            {
                name: `${something}`,
                type: 4
            }
        ]
    });
}

discordClient.once('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);

    setBotStatus('😎 Just chilling')
});

discordClient.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.mentions.has(discordClient.user)) {
        if (message.content.includes("start")) {
            const statusMessage = await message.channel.send("🕐 Ok, trying to start the EC2 instance...")

            ec2.startInstances({ InstanceIds: ['i-0166f56e9cd692037'] }).promise()
                .then((result) => {
                    console.log('Start success:', result);
                    statusMessage.edit(`✅ Started the EC2 instance. If the server doesn\'t show up in a few minutes something\'s broken.`)

                    setBotStatus('⛏️ instance is running!')
                })
                .catch((error) => {
                    console.log('Start failed:', error);
                    statusMessage.edit(`❌ Something broke. gg`)

                    setBotStatus('😞 problem starting')
                })
        }

        if (message.content.includes("stop")) {
            const statusMessage = await message.channel.send("🕐 Ok, trying to stop the EC2 instance...")

            ec2.stopInstances({ InstanceIds: ['i-0166f56e9cd692037'] }).promise()
                .then((result) => {
                    console.log('Stop success:', result);
                    statusMessage.edit(`✅ Stopped the EC2 instance.`)

                    setBotStatus('😎 Just chilling')
                })
                .catch((error) => {
                    console.log('Stop failed:', error);
                    statusMessage.edit(`❌ Something broken. Ping Trent`)

                    setBotStatus('😞 problem stopping')
                })
        }
    }
});

discordClient.login(discordToken);
