export interface ServerConfiguration {
    auth: {
        enabled: boolean,
        authRoleId?: string
    },
    honeypot: {
        enabled: boolean,
        channelId?: string,
        action: HoneypotAction,
        messageRemoval: boolean
    },
    logging: {
        enabled: boolean
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
    auth: { enabled: false, authRoleId: "" },
    honeypot: { enabled: false, channelId: "none", action: HoneypotAction.NONE, messageRemoval: true },
    logging: { enabled: false, channel: "" },
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
