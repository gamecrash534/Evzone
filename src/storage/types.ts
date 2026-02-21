export interface ServerConfiguration {
    auth: {
        authRoleId?: string
    },
    honeypot: {
        channelId?: string,
        action: HoneypotAction,
        messageRemoval: boolean
    },
    logging: {
        channel?: string
    },
    incident: number
}

export enum HoneypotAction {
    BAN,
    TIMEOUT,
    KICK,
    NONE
}

export const DefaultConfiguration : ServerConfiguration = {
    auth: { authRoleId: "" },
    honeypot: { channelId: "none", action: HoneypotAction.NONE, messageRemoval: true },
    logging: { channel: "" },
    incident: 0
}

type HoneypotActionStringMap = Record<HoneypotAction, string>;
export const honeypotActionStringMap: HoneypotActionStringMap = {
    [HoneypotAction.BAN]: "Ban",
    [HoneypotAction.KICK]: "Kick",
    [HoneypotAction.TIMEOUT]: "24d Timeout",
    [HoneypotAction.NONE]: "Nothing",
}

type HoneypotActionReverseStringMap = Record<string, HoneypotAction>;
export const stringHoneypotActionMap: HoneypotActionReverseStringMap = {
    "ban": HoneypotAction.BAN,
    "kick": HoneypotAction.KICK,
    "timeout": HoneypotAction.TIMEOUT,
    "none": HoneypotAction.NONE,
};
