import { Client, Events, GatewayIntentBits, Guild, Message, MessageFlags, Partials, PresenceUpdateStatus, User } from "discord.js";
import { Config } from "../config/index.js";
import { Storage } from "../storage/index.js";
import { HoneypotAction, ServerConfiguration } from "../storage/types.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const maxMessageCreationDiff = 4 * 60 * 1000;

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
        client.user?.setStatus(PresenceUpdateStatus.Online);
        console.log(`[+] Client ready, logged in as ${c.user.username}`);
    });

    client.on(Events.MessageCreate, async (msg) => {
        if (!msg.guildId) return;

        const server = await getServer(msg.guildId);
        if (!server?.honeypot.enabled || server.honeypot.channelId != msg.channelId) return;

        handleHoneypotMessage(msg as Message<true>, server);
    });

    client.on(Events.GuildMemberAdd, async (usr) => {
        const server = await getServer(usr.guild.id);
        if (!server?.auth.enabled) return;

        usr.createDM().then(dm => {
            const button = new ButtonBuilder()
                .setCustomId(`i_${usr.guild.id}`)
                .setLabel(`Verify`)
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            dm.send({
                content: `Welcome to ${usr.guild.name}, <@${usr.id}>!\nPlease verify yourself by clicking the button below.`,
                components: [row]
            });
        })
    });

    client.on(Events.InteractionCreate, async (e) => {
        if (!e.isButton()) return;

        let guild = await client.guilds.fetch(e.customId.split("i_")[1]);
        let member = await guild.members.fetch(e.user);

        const server = await getServer(guild.id);
        if (!server) return;

        member.roles.add(server.auth.authRoleId!);

        await e.reply({ content: "Thanks for verifying! Do not do the cat", flags: MessageFlags.Ephemeral })
    })
}

//#region helper/handling methods
async function getServer(id: string) : Promise<ServerConfiguration | undefined> {
    const server = await Storage.getServer(id);
    if (!server) {
        console.warn(`[~] Config for server ${id} not found, skipping.`)
        return;
    }
    return server;
}

function handleHoneypotMessage(message: Message<true>, conf: ServerConfiguration) {
    let guild = message.guild;
    let user = message.author;

    handleHoneypotAction(guild, user, conf.honeypot.action).catch(e => {
        console.error(`[-] Error when trying to handle honeypot action of ${user.id} (Action: ${conf.honeypot.action}):`, (e as Error).message);
    });

    if (conf.honeypot.messageRemoval) {
        try {
            bulkDeleteUserMessages(guild, user);
        } catch (e) {
            console.error(`[-] Error when trying to bulk delete messages of ${user.id}:`, (e as Error).message);
        }
    }
}

function bulkDeleteUserMessages(guild: Guild, user: User) {
    const now = Date.now();
    guild.channels.fetch()
        .then(channels => {
            channels.forEach(async ch => {
                if (!ch?.isTextBased() || 
                !ch.permissionsFor(guild.members.me!)?.has(["ViewChannel", "ReadMessageHistory", "ManageMessages"])) return;

                let messages = (await ch.messages.fetch({ limit: 4 }))
                .filter(msg => msg.author.id === user.id && (now - msg.createdTimestamp) <= maxMessageCreationDiff);
                
                ch.bulkDelete(messages);
            })
        })
}

async function handleHoneypotAction(guild: Guild, user: User, action: HoneypotAction) {
    switch (action) {
        case HoneypotAction.BAN:
            await guild.members.ban(user, { reason: "Detected user writing message into honeypot" });
            break;
        case HoneypotAction.KICK:
            await guild.members.kick(user, "Detected user writing message into honeypot");
            break;
        case HoneypotAction.TIMEOUT:
            const member = await guild.members.fetch(user);
            await member.timeout(2.419e+9, "Detected user writing message into honeypot");
            break;
        default:
            break;
    }
}
//#endregion