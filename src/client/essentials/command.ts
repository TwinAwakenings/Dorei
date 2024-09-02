import { ApplicationCommandOption, ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { Category } from "../../enums/Category";
import { Dorei_Client, IDorei_Client } from "../client";


export class Command implements ICommand {
    client: IDorei_Client
    name: string
    description: string
    detailedDescription?: string | undefined
    category?: Category | undefined
    options?: ICommandOptions[] | undefined
    dev?: boolean | undefined
    cooldown?: number | undefined
    cooldownFilteredUsers?: string[] | undefined
    enabled?: boolean | undefined
    dm_permission?: boolean | undefined
    nsfw?: boolean | undefined
    requiredClientPermissions?: string[] | undefined
    requiredUserPermissions?: string[] | undefined

    constructor(client: Dorei_Client, options: IClientCommandOptions) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.detailedDescription = options.detailedDescription
        this.category = options.category
        this.options = options.options
        this.dev = options.dev 
        this.cooldown = options.cooldown
        this.cooldownFilteredUsers = options.cooldownFilteredUsers
        this.enabled = options.enabled
        this.dm_permission = options.dm_permission
        this.nsfw = options.nsfw
        this.requiredClientPermissions = options.requiredClientPermissions
        this.requiredUserPermissions = options.requiredUserPermissions
    }

    async execute(interaction: ChatInputCommandInteraction) {
        
    }

    async autoComplete(interaction: AutocompleteInteraction) {

    }
}

export interface IClientCommandOptions {
    name: string
    description: string
    detailedDescription?: string | undefined
    category?: Category | undefined
    options?: ICommandOptions[] | undefined
    dev?: boolean | undefined
    cooldown?: number | undefined
    cooldownFilteredUsers?: string[] | undefined
    enabled?: boolean | undefined
    dm_permission?: boolean | undefined
    nsfw?: boolean | undefined
    requiredClientPermissions?: string[] | undefined
    requiredUserPermissions?: string[] | undefined
}

export interface ICommandOptions {
    name: string
    description: string
    type: ApplicationCommandOptionType[]
    required: boolean
    choices?: {
        name: string
        value: string
    }[]
}

export interface ICommand {
    client: IDorei_Client
    name: string
    description: string
    detailedDescription?: string | undefined
    category?: Category | undefined
    options?: ICommandOptions[] | undefined
    dev?: boolean | undefined
    cooldown?: number | undefined
    cooldownFilteredUsers?: string[] | undefined
    enabled?: boolean | undefined
    dm_permission?: boolean | undefined
    nsfw?: boolean | undefined
    requiredClientPermissions?: string[] | undefined
    requiredUserPermissions?: string[] | undefined

    execute(interaction: ChatInputCommandInteraction)
    autoComplete(interaction: AutocompleteInteraction)

}

