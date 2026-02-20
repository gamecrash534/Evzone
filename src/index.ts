import { Client, GatewayIntentBits } from "discord.js";
import { getConfig } from "./config/index.js";
import { DiscordClient } from "./client/index.js";
import { Storage } from "./storage/index.js";

const config = getConfig();

if (!config.token || !config.storageLocation) throw new Error("Missing Environment Variable(s)!");

await Storage.init(config);
await DiscordClient.start(config);