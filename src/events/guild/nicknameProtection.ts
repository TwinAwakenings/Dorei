import { AuditLogEvent, Events, GuildMember } from "discord.js";
import { shiro_Client } from "../../client/client";
import { Event } from "../../client/essentials/event";
import config from "../../config";


export default class nicknameProtectionEvent extends Event {
    constructor(client: shiro_Client) {
        super(client, {
            name: Events.GuildMemberUpdate,
            once: false,
            description: "Protect's user from having their nickname changed",
            enabled: true,
        })
    }

    async execute(oldMember: GuildMember, newMember: GuildMember) {
        const a = newMember.guild.members.cache.get(this.client.user.id)
        if (!a.permissions.has("ManageNicknames")) return
            if ((newMember.nickname !== oldMember.nickname) && (newMember.user.bot == false)) {
                const db = this.client.database.nicknameProtection

                const data = await db.findMany({where: {userId: newMember.user.id, guildId: newMember.guild.id}})


                if (data.some(user => user.userId === newMember.user.id )) {
                    const audit = await newMember.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MemberUpdate,
                    })

                    if(audit.entries.first().executor.id == this.client.user.id) {
                        return
                    }
                    
                    if (audit.entries.first().executor.id !== newMember.user.id) {
                        try {
                            await newMember.setNickname(oldMember.nickname)
                        } catch (error) {
                            if (error) {
                                return
                            }
                            
                        }

                        await audit.entries.first().executor.send({content: `[${newMember.guild.name}]\nYou tried to change **${newMember.user.username}'s** nickname to **${newMember.nickname}** but you got blocked by the nickname protection system. \nDm <@${config.owner}> to get added/removed from the list.\n https://tenor.com/view/twenty-century-fox-meme-gfy-go-fuck-yourself-meme-get-lost-gif-26260205`})
                        await newMember.user.send(`${audit.entries.first().executor.username} tried to change your nickname to **${newMember.nickname}** but got blocked by the nickname protection system.`)
                        
                    }
                }
            }
        
    }
}