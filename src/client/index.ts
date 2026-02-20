import { ActivityType, Client, Events, GatewayIntentBits, Guild, Message, MessageFlags, Partials, PresenceUpdateStatus, User } from "discord.js";
import { Config } from "../config/index.js";
import { Listener } from "./listener.js";
import { BaseCommand } from "../commands/BaseCommand.js";
import { setupCommand } from "../commands/SetupCommand.js";


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
    export let commands: Map<string, BaseCommand> = new Map();

    export async function start(configuration: Config) {
        config = configuration;

        registerCommands(commands);
        await client.login(config.token);
    }

    client.once(Events.ClientReady, async (c) => {
        client.user?.setPresence({ status: PresenceUpdateStatus.Online, activities: [
            { name: "Watching the honey pot", type: ActivityType.Watching },
            { name: "Listening to the honey pot", type: ActivityType.Listening },
            { name: "Playing with the honey pot", type: ActivityType.Playing }
        ] });
        console.log(`[+] Client ready, logged in as ${c.user.username}`);

        try {
            let commandData = Array.from(commands.values()).map(cmd => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
            await client.application?.commands.set(commandData);
            console.log(`[+] Commands synced successfully.`);
        } catch (e) {
            console.error(`[-] Command sync failed: `, e);
        }
    });

    Listener.register(client);
}

async function registerCommands(commands: Map<string, BaseCommand>) {
    commands.set(setupCommand.name, setupCommand);


}