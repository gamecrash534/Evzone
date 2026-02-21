import { Guild, Message, User } from "discord.js";
import { ActionsLogger } from "../client/logger.js";
import { HoneypotAction, ServerConfiguration } from "../storage/types.js";

const maxMessageAge = 3 * 60 * 1000;

export namespace HoneypotHandler {
    export function handleHoneypotMessage(message: Message<true>, conf: ServerConfiguration) {
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
    
    export function bulkDeleteUserMessages(guild: Guild, user: User) {
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
    
    export async function handleHoneypotAction(guild: Guild, user: User, action: HoneypotAction) {
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
}