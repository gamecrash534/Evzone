import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Events, Guild, InteractionType, Message, MessageComponent, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { ServerConfiguration } from "../storage/types.js";
import { Storage } from "../storage/index.js";
import { DiscordClient } from "./index.js";
import { Honeypot } from "../handler/honeypot.js";
import { Utils } from "../utils/utils.js";
import { Verification } from "../handler/verification.js";

export namespace Listener {
    export function register(client: Client) {
        client.on(Events.MessageCreate, async (msg) => {
            if (!msg.guildId) return;
    
            const server = await Utils.getServer(msg.guildId);
            if (!server?.honeypot.enabled || server.honeypot.channelId != msg.channelId) return;
    
            Honeypot.handleHoneypotMessage(msg as Message<true>, server);
        });
    
        client.on(Events.GuildMemberAdd, async (usr) => {
            const server = await Utils.getServer(usr.guild.id);
            if (!server?.auth.enabled) return;
    
            Verification.sendMessage(usr);
        });
    
        client.on(Events.InteractionCreate, async (e) => {
            if (e.isCommand()) {
                const command = DiscordClient.commands.get(e.commandName);
                if (command) {
                    try {
                        await command.execute(e as any);
                    } catch (error) {
                        console.error(`[-] Error on command execution: `, error);
                        await e.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
                    }
                }
                return;
            } else if (e.isMessageComponent()) Verification.handleVerificationInteraction((e as ButtonInteraction), client);
        })
    }
}