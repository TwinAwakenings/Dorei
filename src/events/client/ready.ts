import { ActivityType, Collection, Events, PresenceStatusData, Routes } from "discord.js";
import {Event} from "../../client/essentials/event"
import { shiro_Client } from "../../client/client";
import config from "../../config"
import Command, { IClientCommandOptions } from "../../client/essentials/command";
import chalk from "chalk"
import { REST } from "@discordjs/rest"

export default class Ready extends Event {
    constructor(client: shiro_Client) {
        super(client, {
            name: Events.ClientReady,
            description: "Ready event",
        })
    }

    async execute() {
        console.log(chalk.green(`${chalk.cyan(this.client.user?.tag)} is now ${chalk.blueBright("ready")} in ${chalk.white(this.client.dev ? "development" : "production")} mode`))
        
        //set presence

        this.client.user.setPresence({
            status: this.client.dev ? config.dev.presence.status as PresenceStatusData : config.main.presence.status as PresenceStatusData,

            activities: [
                {
                    name: this.client.dev ? config.dev.presence.activity.name : config.main.presence.activity.name,
                    type: this.client.dev ? config.dev.presence.activity.type as ActivityType : config.main.presence.activity.type as ActivityType
                }
            ]
        })


        const presence = this.client.user.presence;
        if(presence.activities.length > 0) console.log(chalk.yellow(`Presence: "${presence?.activities[0]?.name}" Status: ${presence?.status}`))

            
        const clientId = this.client.user?.id ?? ""
        const rest = new REST().setToken(this.client.dev ? (process.env.dev_bot_token ?? "") : (process.env.bot_token ?? ""));

        if (!this.client.dev) {
            const globalCmds: any = await rest.put(Routes.applicationCommands(clientId), {
                body: this.GetJson(this.client.commands.filter(command => !command.dev))
            })
            console.log(chalk.green(`Succesfully loaded ${chalk.blue(globalCmds.length)} global (/) commands`))

            let gCmd = globalCmds.map((cmd: { name: any; id: any; }) => {
                return { Commands: cmd.name, Id: cmd.id };
            });

            console.table(gCmd)

        }

        const devCmds: any = await rest.put(Routes.applicationGuildCommands(clientId, config.dev.server), {
            body: this.GetJson(this.client.commands.filter(command => command.dev))
        })

        console.log(chalk.green(`Successfully loaded ${chalk.blueBright(devCmds.length)} dev (/) commands`))


        let dCmd = devCmds.map((cmd: { name: any; id: any; }) => {
            return { Commands: cmd.name, Id: cmd.id };
        });
        console.table(dCmd)

    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = []

        commands.forEach((command: IClientCommandOptions) => {
            data.push({
                name: command.name,
                description: command.description,
                detailedDescription: command.detailedDescription ?? "",
                options: command.options,
                dev: command.dev,
                category: command.category,
                cooldown: command.cooldown ?? 3,
                cooldownFilteredUsers: command.cooldownFilteredUsers ?? [],
                nsfw: command.nsfw,
                dm_permission: command.dm_permission,
                enabled: command.enabled
            })
        })

        return data
    }
}