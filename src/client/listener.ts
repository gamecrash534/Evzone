import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Events, Guild, InteractionType, Message, MessageComponent, MessageFlags, User } from "discord.js";
import { HoneypotAction, ServerConfiguration } from "../storage/types.js";
import { Storage } from "../storage/index.js";
import { ActionsLogger } from "./logger.js";
import { DiscordClient } from "./index.js";

const maxMessageAge = 10 * 60 * 1000;

export namespace Listener {

    export function register(client: Client) {
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
            switch (e.type) {
                case InteractionType.ApplicationCommand: {
                    const command = DiscordClient.commands.get(e.commandName);
                    if (command) {
                        try {
                            await command.execute(e as any);
                        } catch (error) {
                            console.error(`[-] Error on command execution: `, error);
                            await e.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
                        }
                    }
                    break;
                }
                case InteractionType.MessageComponent: {
                    let guild = await client.guilds.fetch((e as ButtonInteraction).customId.split("i_")[1]);
                    let member = await guild.members.fetch(e.user);
            
                    const server = await getServer(guild.id);
                    if (!server) return;
            
                    member.roles.add(server.auth.authRoleId!);
            
                    await e.reply({ content: "Thanks for verifying! Do not do the cat", flags: MessageFlags.Ephemeral })
                    break;
                }
            }
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

        ActionsLogger.logAction(conf, { guild: guild, user: { id: user.id, name: user.username } })
    }
    
    function bulkDeleteUserMessages(guild: Guild, user: User) {
        const now = Date.now();
        guild.channels.fetch()
            .then(channels => {
                channels.forEach(async ch => {
                    if (!ch?.isTextBased() || 
                    !ch.permissionsFor(guild.members.me!)?.has(["ViewChannel", "ReadMessageHistory", "ManageMessages"])) return;
    
                    let messages = (await ch.messages.fetch({ limit: 4 }))
                    .filter(msg => msg.author.id === user.id && (now - msg.createdTimestamp) <= maxMessageAge);
                    
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
}