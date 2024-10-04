import { ChatInputCommandInteraction } from "discord.js";
import { shiro_Client } from "../client";


export default class SubCommand implements ISubCommand {
    client: shiro_Client;
    name: string;
    enabled: boolean | undefined;

    constructor(client: shiro_Client, options: IClientSubCommandOptions) {
        this.client = client
        this.name = options.name
        this.enabled = options.enabled ?? true
    }

    execute(interaction: ChatInputCommandInteraction) {
        
    }
}

export interface IClientSubCommandOptions {
    name: string
    enabled?: boolean | undefined
}

export interface ISubCommand {
    client: shiro_Client
    name: string
    enabled: boolean | undefined

    execute(interaction: ChatInputCommandInteraction)
}