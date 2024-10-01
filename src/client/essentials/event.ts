import { Events } from "discord.js";
import { shiro_Client } from "../client";

export class Event implements IEvent {
    client: shiro_Client;
    name: Events;
    description: string;
    once: boolean;
    enabled: boolean;
    constructor(client: shiro_Client, options: IClientEventOptions) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.once = options.once ?? false
        this.enabled = options.enabled ?? true
    }

    async execute(...args: any)  {
        
    }
}

export interface IEvent {
    client: shiro_Client
    name: Events
    description: string
    once?: boolean | undefined
    enabled?: boolean | undefined
}

export interface IClientEventOptions {
    name: Events
    description: string
    once?: boolean | undefined
    enabled?: boolean | undefined
}