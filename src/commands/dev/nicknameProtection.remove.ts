import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { shiro_Client } from "../../client/client";
import Command from "../../client/essentials/command";
import SubCommand from "../../client/essentials/subCommand";


export default class nicknameProtectionRemoveCommand extends SubCommand {
    constructor(client: shiro_Client) {
        super(client, {
            name: "nicknameprotection.remove",
            enabled: true
            
        })
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user")

        const db = this.client.database.nicknameProtection
        const exits = await db.findMany({where: {userId: user.id}})

        if (exits.length == 0) {
            return interaction.reply({ content: "This user is not on the list!", ephemeral: true })
        }

        await db.delete({where: {userId: user.id}}).then(() => {
            return interaction.reply({ content: "Removed user from the list!", ephemeral: true })
        })
    }

}