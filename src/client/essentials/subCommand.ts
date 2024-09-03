import { ChatInputCommandInteraction } from "discord.js";
import { Dorei_Client } from "../client";


export default class SubCommand implements ISubCommand {
    client: Dorei_Client;
    name: string;
    enabled: boolean | undefined;

    constructor(client: Dorei_Client, options: IClientSubCommandOptions) {
        this.client = client
        this.name = options.name
        this.enabled = options.enabled ?? true
    }

    async execute(interaction: ChatInputCommandInteraction) {
        
    }
}

export interface IClientSubCommandOptions {
    name: string
    enabled?: boolean | undefined
}

export interface ISubCommand {
    client: Dorei_Client
    name: string
    enabled: boolean | undefined

    execute(interaction: ChatInputCommandInteraction)
}