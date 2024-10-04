import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { shiro_Client } from "../../client/client";
import Command from "../../client/essentials/command";


export default class nicknameProtectionCommand extends Command {
    constructor(client: shiro_Client) {
        super(client, {
            name: "nicknameprotection",
            description: "Adds a user to the nickname protection list",
            dev: client.dev,
            options: [
                {
                    name: "add",
                    description: "Adds a user to the nickname protection list",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "User to add to the list",
                            type: ApplicationCommandOptionType.User,
                            required: true      
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Removes a user from the nickname protection list",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "User to remove from the list",
                            type: ApplicationCommandOptionType.User,
                            required: true,
                            autocomplete: true
                        }
                    ]
                }
            ]
        })
    }
}