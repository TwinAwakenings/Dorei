import { ActivityType, PresenceStatusData } from "discord.js";
import tconfig from "../src/tconfig.json"




const config = {
    dev: {
        presence: tconfig.dev.presence,
        server: "1015277694415548467",
        channel: "1225128045417988176",
        testForum: "1237467577446301697"
    },
    
    main: {
        presence: tconfig.prod.presence,
        test: ""
    },
    owner: "655856108350603267" as string,
    mainServer: "704765614627094589",

    commands: {
        lunch: {
            sendWeeklyGuild: "704765614627094589",  
            sendWeeklyChannel: "1280123327507337281", 

        }
    }
}


export default config