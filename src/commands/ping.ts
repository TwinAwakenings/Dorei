import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Dorei_Client } from "../client/client";
import Command from "../client/essentials/command";

export default class pingCommand extends Command {
    constructor(client: Dorei_Client) {
        super(client, {
            name: "ping",
            description: "Ping command",
            dev: client.dev,
            cooldown: 50,
            //cooldownFilteredUsers: ["655856108350603267"]
        })
    }

    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Pong!", ephemeral: true })
    }
}