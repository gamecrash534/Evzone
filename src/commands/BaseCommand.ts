import { CacheType, Interaction, ApplicationCommandOptionData, CommandInteraction, CommandInteractionOptionResolver, AutocompleteInteraction } from "discord.js";

export class BaseCommand {
    name: string;
    description: string;
    options: ApplicationCommandOptionData[];

    constructor(name: string, description: string, options: ApplicationCommandOptionData[] = []) {
        this.name = name;
        this.description = description;
        this.options = options;
    }

    async execute(interaction: AutocompleteInteraction<CacheType>) {
        throw new Error(`Command ${this.name} does not implement an execute method.`);
    }
};
