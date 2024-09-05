import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Dorei_Client } from "../client/client";
import Command from "../client/essentials/command";
import client from "..";

export default class pingCommand extends Command {
    constructor(client: Dorei_Client) {
        super(client, {
            name: "ping",
            description: "Ping command",
            dev: client.dev,
            cooldown: 5,
            dm_permission: true,
            //cooldownFilteredUsers: ["655856108350603267"]
        })
    }
    
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Pong!", ephemeral: true })
    }
}

client.database


