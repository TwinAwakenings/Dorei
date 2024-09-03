import { Dorei_Client } from "../client";
import path from "path"
import { Event } from "../essentials/event"
import { glob } from "glob"


export class EventHandler implements IEventHandler {
    client: Dorei_Client

    constructor(client: Dorei_Client) {
        this.client = client
    }


    async LoadEvents() {
        const files = (await glob("src/events/**/*.{js,ts}")).map(filepath => path.resolve(filepath));


        files.map(async (file: string) => {
            try {

                const event: Event = new (require(file)).default(this.client);

                if (!event.name) {
                    console.log(`${file.split(path.sep).pop()} does not have a name`);
                    return;
                }
                if (!event.enabled) return

                const execute = (...args: any) => event.execute(...args)
                //@ts-ignore
                if (event.once) this.client.once(event.name, execute)
                //@ts-ignore
                else this.client.on(event.name, execute)

                // Delete the cache for the module
                delete require.cache[require.resolve(file)];
                return 
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        });

    }
}

export interface IEventHandler {
    LoadEvents(): void
}