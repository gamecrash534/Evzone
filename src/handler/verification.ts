import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, GuildMember, MessageFlags, } from "discord.js";
import { Utils } from "../utils/utils.js";

export namespace Verification {
    export async function sendMessage(user: GuildMember) {
        user.createDM().then(dm => {
            const button = new ButtonBuilder()
                .setCustomId(`i_${user.guild.id}`)
                .setLabel(`Verify`)
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            dm.send({
                content: `Welcome to ${user.guild.name}, <@${user.id}>!\nPlease verify yourself by clicking the button below.`,
                components: [row]
            });
        })
    }

    export async function handleVerificationInteraction(event: ButtonInteraction, client: Client) {
        let guild = await client.guilds.fetch(event.customId.split("i_")[1]);
        let member = await guild.members.fetch(event.user);

        const server = await Utils.getServer(guild.id);
        if (!server) return;

        member.roles.add(server.auth.authRoleId!);

        await event.reply({ content: "Thanks for verifying! Do not do the cat", flags: MessageFlags.Ephemeral })
        return;
    }
}