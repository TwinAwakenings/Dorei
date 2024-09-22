import { ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { Dorei_Client } from "../client/client";
import Command from "../client/essentials/command";
import client from "..";
import config from "../config";

export default class pingCommand extends Command {
    constructor(client: Dorei_Client) {
        super(client, {
            name: "ping",
            description: "Ping command",
            dev: client.dev,
            cooldown: 5,
            dm_permission: true,
            cooldownFilteredUsers: [config.owner],
            clientPermissions: [PermissionFlagsBits.SendMessages],
            userPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseApplicationCommands]
        })
    }
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Pong!", ephemeral: true })
    }
}

client.database


