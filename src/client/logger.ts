import { Guild, TextChannel, User } from "discord.js";
import { HoneypotAction, honeypotActionStringMap, ServerConfiguration } from "../storage/types.js";
import { EmbedBuilder } from "@discordjs/builders";
import { Storage } from "../storage/index.js";
import { Config } from "../config/index.js";

export namespace ActionsLogger {
    export async function logAction(config: ServerConfiguration, action: Action) {
        if (!config.logging.enabled) return;

        let channel = await action.guild.channels.fetch(config.logging.channel);
        
        if (!channel) {
            console.warn(`[~] Channel ${config.logging.channel} for guild ${action.guild.id} not found - skipping logging`)
            return;
        }

        if (!channel.isTextBased()) {
            console.warn(`[~] Channel ${config.logging.channel} for guild ${action.guild.id} isn't a text channel - skipping logging`)
            return;
        }

        await channel.send({ embeds: [await createEmbed(config, action)] })
    }

    async function createEmbed(config: ServerConfiguration, action: Action) {
        return new EmbedBuilder()
            .setTitle("Honeypot trigger")
            .setColor(0xfc2003)
            .setDescription("A user has stepped into the honeypot:")
            .addFields(
                { name: "User: ", value: `${action.user.name} (<@${action.user.id}>)`, inline: true },
                { name: "Action: ", value: honeypotActionStringMap[config.honeypot.action], inline: true },
                { name: "Deleted Messages of User? ", value: config.honeypot.messageRemoval ? "Yes" : "No", inline: true }
            )
            .setFooter({ text: `Incident N° ${await Storage.incrementIncident(action.guild.id)}` })
    }
}

export interface Action {
    user: {
        id: string,
        name: string
    },
    guild: Guild
}