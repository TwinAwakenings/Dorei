import { ActivityType, PresenceStatusData } from "discord.js";

const config = {
    dev: {
        presence: {
            status: "dnd" as PresenceStatusData,
            activity: {
                name: "", //leave empty for no presence
                type: ActivityType
            }
        },
        server: "1015277694415548467",
        channel: "1225128045417988176"
    },
    
    main: {
        presence: {
            status: "online" as PresenceStatusData,
            activity: {
                name: "", //leave empty for no presence
                type: ActivityType
            }
        }
    },
    owner: "655856108350603267"
}

export default config