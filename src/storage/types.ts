export interface ServerConfiguration {
    auth: {
        enabled: boolean,
        authRoleId?: string
    },
    honeypot: {
        enabled: boolean,
        channelId: string,
        action: HoneypotAction,
        messageRemoval: boolean
    }
}

export enum HoneypotAction {
    BAN,
    TIMEOUT,
    KICK,
    NONE
}

export const DefaultConfiguration : ServerConfiguration = {
    auth: { enabled: false, authRoleId: "" },
    honeypot: { enabled: false, channelId: "none", action: HoneypotAction.NONE, messageRemoval: true }
}