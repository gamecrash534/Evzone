import Module from "module";
import { Config } from "../config/index.js";
import { DefaultConfiguration, ServerConfiguration } from "./types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fsync } from "fs";

export namespace Storage {
    let config : Config;
    const servers : Map<string, ServerConfiguration> = new Map();

    export async function init(configuration: Config) {
        config = configuration;
        if (!(await exists(path.resolve(config.storageLocation!)))) fs.mkdir(path.normalize(path.resolve(config.storageLocation!)));
    }

    export async function getServer(id: string): Promise<ServerConfiguration | undefined> {
        let conf = servers.get(id);
        if (conf) return conf;

        conf = await loadServerConfig(id);
        if (conf) return conf;

        return await createServerConfig(id);
    }

    export async function incrementIncident(id: string) : Promise<number> {
        let cfg = await getServer(id);
        if (!cfg) return 0;
        cfg.incident++;

        await saveServerConfig(id, cfg);
        
        return cfg.incident;
    }

    export async function getIncident(id: string) : Promise<number> {
        let cfg = await getServer(id);
        return cfg ? cfg.incident : 0;
    }

    export async function loadServerConfig(id: string) : Promise<ServerConfiguration | undefined> {
        let resPath = resolveConfigPath(id);

        if (!(await exists(resPath))) return undefined;

        let contents = await fs.readFile(resPath, {encoding: "utf8"});

        try {
            let conf : ServerConfiguration = JSON.parse(contents);
            servers.set(id, conf);
            return conf;
        } catch (e) {
            console.error(`[-] Malformed json for server config ${id}`);
            return undefined;
        }
    }

    export async function saveServerConfig(id: string, config: ServerConfiguration) {
        let resPath = resolveConfigPath(id);

        try {
            await fs.writeFile(resPath, JSON.stringify(config), { encoding: "utf-8" });
            servers.set(id, config);
        } catch (e) {
            console.error(`[-] Could not save configuration for server ${id}: ${e}`);
        }

        return;
    }

    export async function createServerConfig(id: string) : Promise<ServerConfiguration | undefined> {
        let resPath = resolveConfigPath(id);

        const conf = DefaultConfiguration;

        try {
            await fs.writeFile(resPath, JSON.stringify(conf), { encoding: "utf-8" });
            servers.set(id, conf);
            return conf;
        } catch (e) {
            console.error(`[-] Could not create configuration for server ${id}: ${e}`);
            return undefined;
        }
    }

    export async function exists(path: string) : Promise<boolean> {
        try {
            await fs.access(path, fs.constants.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    function resolveConfigPath(id : string) {
        return path.normalize(path.resolve(config.storageLocation + "/" + id + ".json"))
    }
}