import { glob } from "glob";
import { Dorei_Client } from "../client";
import path from "path"
import Command from "../essentials/command";
import SubCommand from "../essentials/subCommand";


export class CommandHandler implements ICommandHandler {
    client: Dorei_Client

    constructor(client: Dorei_Client) {
        this.client = client
    }

    async LoadCommands() {
        const files = (await glob("src/commands/**/*.{js,ts}")).map(filepath => path.resolve(filepath));


        files.map(async (file: string) => {
            try {

                const command: Command | SubCommand = new (require(file)).default(this.client);

                if (!command.name) {
                    console.log(`${file.split(path.sep).pop()} does not have a name`);
                    return;
                }
                
                if (command.enabled === undefined) command.enabled = true
                if(!command.enabled) return;

                if (file.split("/").pop()?.split(".")[2] !== undefined) {
                    this.client.subCommands.set(command.name, command as SubCommand);
                } else {
                    this.client.commands.set(command.name, command as Command);
                    
                }

                // Delete the cache for the module
                delete require.cache[require.resolve(file)];
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        });

    }
}

export interface ICommandHandler {
    LoadCommands(): void
}