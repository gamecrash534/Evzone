import { config } from "dotenv"

export interface Config {
    token?: string,
    storageLocation?: string,
}

config();

export function getConfig() : Config {
    return { token: process.env.DISCORD_TOKEN, storageLocation: process.env.STORAGE_LOCATION }
}