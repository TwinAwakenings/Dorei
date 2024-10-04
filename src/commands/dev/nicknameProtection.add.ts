import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { shiro_Client } from "../../client/client";
import Command from "../../client/essentials/command";
import SubCommand from "../../client/essentials/subCommand";

export default class nicknameProtectionAddCommand extends SubCommand {
    constructor(client: shiro_Client) {
        super(client, {
            name: "nicknameprotection.add",
            enabled: true
            
        })
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user")

        const db = this.client.database.nicknameProtection
        const exits = await db.findMany({where: {userId: user.id}})

        if (exits.length > 0) {
            return interaction.reply({ content: "This user is already in the list!", ephemeral: true })
        }

        await db.create({data: {userId: user.id}}).then(() => {
            return interaction.reply({ content: "Added user to the list!", ephemeral: true })
        })
        
    }

}