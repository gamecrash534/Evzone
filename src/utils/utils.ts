import { Storage } from "../storage/index.js";
import { ServerConfiguration } from "../storage/types.js";

export namespace Utils {
    export async function getServer(id: string) : Promise<ServerConfiguration | undefined> {
        const server = await Storage.getServer(id);
        if (!server) {
            console.warn(`[~] Config for server ${id} not found, skipping.`)
            return;
        }
        return server;
    }
}