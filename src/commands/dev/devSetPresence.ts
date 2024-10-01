import { ActivityType, ApplicationCommandOptionType, ChatInputCommandInteraction, ClientPresence, PresenceStatusData } from "discord.js";
import { shiro_Client } from "../../client/client";
import Command from "../../client/essentials/command";
import config from "../../config";
import { Category } from "../../enums/Category";
import path from "path"
import fs from "fs"


export default class devSetPresenceCommand extends Command {
    constructor(client: shiro_Client) {
        super(client, {
            name: "setpresence",
            description: "Sets the bot's presence",
            category: Category.Dev,
            dm_permission: true,
            enabled: client.dev,
            cooldown: 30,
            userPermissions: ["Administrator"],
            dev: true,
            options: [
                {
                    name: "type",
                    description: "Dev or Prod",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "dev",
                            value: "dev",
                        },
                        {
                            name: "prod",
                            value: "prod",
                        },
                    ]
                },
                {
                    name: "status",
                    description: "The status to set the bot to",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "online",
                            value: "online",
                        },
                        {
                            name: "idle",
                            value: "idle",
                        },
                        {
                            name: "dnd",
                            value: "dnd",
                        },
                        {
                            name: "invisible",
                            value: "invisible",
                        }
                    ]
                },
                {
                    name: "activity_name",
                    description: "The name of activity to set the bot to",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "activity_type",
                    description: "The activity type to set the bot to",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    choices: [
                        {
                            name: "Playing",
                            value: ActivityType.Playing,
                        },
                        {
                            name: "Streaming",
                            value: ActivityType.Streaming,
                        },
                        {
                            name: "Listening",
                            value: ActivityType.Listening,
                        },
                        {
                            name: "Watching",
                            value: ActivityType.Watching,
                        },
                        {
                            name: "Competing",
                            value: ActivityType.Competing,
                        }
                    ]
                }
            ]
            
            
        })


        
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const status = interaction.options.getString("status") as PresenceStatusData
        const activity_name = interaction.options.getString("activity_name") as string
        const activity_type = interaction.options.getInteger("activity_type") as ActivityType
        const type = interaction.options.getString("type") as string

        const owners = config.owner

        if (!owners.includes(interaction.user.id)) {
            return interaction.reply({
                content: "You are not the owner of this bot.",
                ephemeral: true
            })
        }

        this.client.user.setPresence({
            status: status,
            activities: [
                {
                    name: activity_name,
                    type: activity_type
                }
            ]
        })

        const filePath = path.join(__dirname, "../../tconfig.json");
        try {
            this.savePresence(filePath, { status, activity_type, activity_name }, type)
        } catch (error) {
            console.error("Error saving presence:", error);
        }
        
            

        return interaction.reply({
            content: "Presence set.",
            ephemeral: true
        })

    }

    private savePresence(filePath, { status, activity_type, activity_name }, type) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return err;
            }

            try {
                // Parse the JSON data into a JavaScript object
                const jsonObject = JSON.parse(data);

                // Modify the values in the object
                if (type === "dev") {
                    //json
                    jsonObject.dev.presence.activity.name = activity_name;
                    jsonObject.dev.presence.status = status;
                    jsonObject.dev.presence.activity.type = activity_type;

                    config.dev.presence = {
                        status: status,
                        activity: {
                            name: activity_name,
                            type: activity_type
                        },                   
                    }
                } 
                if (type === "prod") {
                    //json
                    jsonObject.prod.presence.activity.name = activity_name;
                    jsonObject.prod.presence.status = status;
                    jsonObject.prod.presence.activity.type = activity_type;

                    config.main.presence = {
                        status: status,
                        activity: {
                            name: activity_name,
                            type: activity_type
                        },  
                    }           
                }

                // Convert the modified object back to a JSON string
                const updatedJsonString = JSON.stringify(jsonObject, null, 2);

                // Write the updated JSON string back to the file
                fs.writeFile(filePath, updatedJsonString, 'utf8', (err) => {
                    if (err) {
                        return err;
                        
                    }
                    console.log("Status data inside config updated");
                });
            } catch (jsonParseError) {
                return jsonParseError;;
            }
        })
    }
}