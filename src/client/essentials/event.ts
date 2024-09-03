import { Events } from "discord.js";
import { Dorei_Client } from "../client";

export class Event implements IEvent {
    client: Dorei_Client;
    name: Events;
    description: string;
    once: boolean;
    enabled: boolean;
    constructor(client: Dorei_Client, options: IClientEventOptions) {
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
    client: Dorei_Client
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