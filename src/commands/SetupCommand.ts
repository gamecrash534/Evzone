import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, CacheType, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, CommandInteractionOptionResolver, Interaction, LabelBuilder, MessageFlags, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import { DefaultConfiguration, honeypotActionStringMap, ServerConfiguration } from "../storage/types.js";

class SetupCommand extends BaseCommand {
    constructor() {
        super("setup", "Set this bot up for the server")
    }

    async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.guildId) {
            await interaction.reply({ content: "This command can *not* be used in DMs! Nice try :D" });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId("modal_setup")
            .setTitle("Setup for Evzone")
            .addLabelComponents([
                new LabelBuilder()
                    .setLabel("Honeypot Channel")
                    .setDescription("The channel that should act as a honeypot. Remove to disable feature")
                    .setChannelSelectMenuComponent(new ChannelSelectMenuBuilder()
                    .setCustomId("modal_setup_channel")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)
                ),
                new LabelBuilder()
                    .setLabel("Honeypot Action")
                    .setDescription("What moderative action should be applied on the user that triggers the honeypot")
                    .setStringSelectMenuComponent(new StringSelectMenuBuilder()
                        .setCustomId("modal_setup_action")
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Nothing")
                                .setValue("none")
                                .setDescription("There will be no moderative action for the user")
                                .setDefault(true),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Ban")
                                .setValue("ban")
                                .setDescription("The user will be banned"),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Kick")
                                .setValue("kcik")
                                .setDescription("The user will be kicked from the server"),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Timeout")
                                .setValue("timeout")
                                .setDescription("The user will be timed out for 24 days")
                        )
                ),
                new LabelBuilder()
                    .setLabel("Remove Messages of User")
                    .setDescription("Set to 'Yes' to delete messages of a honeypotted user from the past 3 minutes")
                    .setStringSelectMenuComponent(new StringSelectMenuBuilder()
                        .setCustomId("modal_setup_msgrm")
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Yes")
                                .setValue("true")
                                .setDefault(true),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("No")
                                .setValue("false")
                        )
                ),
                new LabelBuilder()
                    .setLabel("Logging Channel")
                    .setDescription("The channel where honeypot catches should be logged to. Remove to disable feature")
                    .setChannelSelectMenuComponent(new ChannelSelectMenuBuilder()
                    .setCustomId("modal_setup_logging")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)
                ),
                new LabelBuilder()
                    .setLabel("Verification Role")
                    .setDescription("Role given by reacting to a DM sent from the bot. Might prevent bots. Remove role to disable feature")
                    .setRoleSelectMenuComponent(new RoleSelectMenuBuilder()
                        .setCustomId("modal_setup_auth")
                        .setRequired(false)
                )
            ]);
        
        await interaction.showModal(modal);
    }
}
export const setupCommand = new SetupCommand();