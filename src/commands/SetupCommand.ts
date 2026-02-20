import { ApplicationCommandOptionType, AutocompleteInteraction, CacheType, CommandInteraction, CommandInteractionOptionResolver, Interaction } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import { ServerConfiguration } from "../storage/types.js";

class SetupCommand extends BaseCommand {
    constructor() {
        super("setup", "Set this bot up for the server", [
            
        ])
    }

    async execute(interaction: AutocompleteInteraction<CacheType>) {
        
    }
}
export const setupCommand = new SetupCommand();