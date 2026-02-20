import { ActivityType, Client, Events, GatewayIntentBits, Guild, Message, MessageFlags, Partials, PresenceUpdateStatus, User } from "discord.js";
import { Config } from "../config/index.js";
import { Listener } from "./listener.js";


export namespace DiscordClient {
    const client : Client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
    ], partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
    ]});

    let config : Config;

    export async function start(configuration: Config) {
        config = configuration;
        await client.login(config.token);
    }

    client.once(Events.ClientReady, (c) => {
        client.user?.setPresence({ status: PresenceUpdateStatus.Online, activities: [
            { name: "Watching the honey pot", type: ActivityType.Watching },
            { name: "Listening to the honey pot", type: ActivityType.Listening },
            { name: "Playing with the honey pot", type: ActivityType.Playing }
        ] });
        console.log(`[+] Client ready, logged in as ${c.user.username}`);
    });

    Listener.register(client);
}