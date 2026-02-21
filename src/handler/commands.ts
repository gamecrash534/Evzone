import { ChannelType, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ServerConfiguration, stringHoneypotActionMap } from "../storage/types.js";
import { Storage } from "../storage/index.js";

export namespace CommandHandler {
    export async function handleModalSubmission(e: ModalSubmitInteraction) {
        if (e.customId !== "modal_setup") {
            e.reply({ content: "This kind of modal was not found. What?!", flags: MessageFlags.Ephemeral });
            return;
        }

        let f = e.fields;

        let channel = f.getSelectedChannels<ChannelType.GuildText>("modal_setup_channel");
        let action = f.getStringSelectValues("modal_setup_action")[0];
        let messageRemoval = f.getStringSelectValues("modal_setup_msgrm")[0];
        let logging = f.getSelectedChannels<ChannelType.GuildText>("modal_setup_logging");
        let auth = f.getSelectedRoles("modal_setup_auth");

        const config: ServerConfiguration = {
            auth: { enabled: auth ? true : false, authRoleId: auth?.keyAt(0) },
            honeypot: { enabled: channel ? true : false, channelId: channel?.keyAt(0), messageRemoval: messageRemoval === "true", 
                action: stringHoneypotActionMap[action] },
            logging: { enabled: logging ? true : false, channel: logging?.keyAt(0) },
            incident: await Storage.getIncident(e.guildId!)
        }
        
        await Storage.saveServerConfig(e.guildId!, config);

        console.log(`[+] Saved new configuration for guild ${e.guildId}, by user ${e.user.id}`)

        e.reply({ content: "Settings saved successfully!", flags: MessageFlags.Ephemeral })
    }
}