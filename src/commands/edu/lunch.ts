import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js"
import { shiro_Client } from "../../client/client"
import Command from "../../client/essentials/command"
import { Category } from "../../enums/Category"
import fs from "fs"
import { firefox, Page } from "playwright"
import path from "path"
import config from "../../config"
import client from "../.."


export default class LunchCommand extends Command {
    constructor(client: shiro_Client) {
        super(client, {
            name: "lunch",
            description: "Shows lunch menu for current week",
            dev: client.dev,
            cooldown: 20,
            dm_permission: true,
            cooldownFilteredUsers: ["655856108350603267"],
            clientPermissions: [PermissionFlagsBits.SendMessages],
            userPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseApplicationCommands],
            category: Category.Edu,
            enabled: true,

        })
    }

    async execute(interaction: ChatInputCommandInteraction) {
        interaction.deferReply()
        const browser = await firefox.launch({headless: true})
        const page = await browser.newPage()
        try {
            await page.goto("https://eskoly.sk/partizanska1057")
        } catch {
            await interaction.editReply({ content: "Something went wrong, try again later" })
            await browser.close()
            return
        }
        

    
        await interaction.editReply({ embeds: [await createEmbed(page)] }).then(async () => {
            
            fs.writeFileSync(path.join(__dirname, "lastWeek.txt"), await getDayRange(page))
            await browser.close()
            console.log("Lunch menu sent by user")
        })
    }
}


async function getDay(day: IDay["day"], page: Page): Promise<{ day: string; date: string, lunchOptions: string }> {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    await page.waitForSelector('.dayColumn')
    const dateString = await page.locator(".dayColumn").nth(daysOfWeek.indexOf(day)).textContent() ?? ""
    await page.waitForSelector('.foodCell')
    const lunchOptions = await page.locator(".foodCell").nth(daysOfWeek.indexOf(day)).innerText()
    

    return {
        day: splitDayAndDate(dateString).day,
        date: splitDayAndDate(dateString).date,
        lunchOptions: lunchOptions.trim()
    }
    
}

async function createEmbed(page: Page): Promise<EmbedBuilder> {
    return new EmbedBuilder()

    .setTitle(`Lunch Menu ${(await getDayRange(page))}`)

    .addFields(
        {
            name: `Monday - ${(await getDay("Monday", page)).date}`,
            value: `${(await getDay("Monday", page)).lunchOptions || "No lunch provided"}`,
            inline: false
        },
        {
            name: `Tuesday - ${(await getDay("Tuesday", page)).date}`,
            value: `${(await getDay("Tuesday", page)).lunchOptions || "No lunch provided"}`,
            inline: false
        },
        {
            name: `Wednesday - ${(await getDay("Wednesday", page)).date}`,
            value: `${(await getDay("Wednesday", page)).lunchOptions || "No lunch provided"}`,
            inline: false
        },
        {
            name: `Thursday - ${(await getDay("Thursday", page)).date}`,
            value: `${(await getDay("Thursday", page)).lunchOptions || "No lunch provided"}`,
            inline: false
        },
        {
            name: `Friday - ${(await getDay("Friday", page)).date}`,
            value: `${(await getDay("Friday", page)).lunchOptions || "No lunch provided"}`,
            inline: false
        },
        
    )
}

function splitDayAndDate(input: string): { day: string, date: string } {
    // Use a regular expression to find the first part (day) and the second part (date)
    const match = input.match(/([^\d]+)([\d\.\s]+)/);

    if (match) {
        const day = match[1].trim();  // First capture group is the day
        const date = match[2].trim(); // Second capture group is the date
        return { day, date };
    }

    // If the input doesn't match the expected pattern, return empty strings
    return { day: '', date: '' };
}

//gets 2. 9. 2024 - 6. 9. 2024 from the page
async function getDayRange(page: Page) {
    await page.waitForSelector('#ctl00_mainContent_Label2')
    const content = await page.locator("#ctl00_mainContent_Label2").textContent()
    if (content === null) {
        throw new Error("Element not found or content is null")
    }
    return processWeek(content.toString())
}

//reduces JEDÁLNY LÍSTOK: 2. 9. 2024 - 6. 9. 2024 to 2. 9. 2024 - 6. 9. 2024 for expample
async function processWeek(dayrange: string) {
    return dayrange.split(":")[1].trim()
}


interface IDay {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
}


async function sendWeekly(guildId: string, channel: string, client: shiro_Client) {
    const lastWeek = fs.readFileSync(path.join(__dirname, "lastWeek.txt"), "utf-8")


    const browser = await firefox.launch({headless: true})
    const page = await browser.newPage()

    try {
        await page.goto("https://eskoly.sk/partizanska1057")
    } catch (err) {
        console.error("Error while getting page" + err)
        await browser.close()
        return
    }
    

    if (!(lastWeek == await getDayRange(page))) {
        fs.writeFileSync(path.join(__dirname, "lastWeek.txt"), await getDayRange(page))
        const guild = client.guilds.cache.get(client.dev ? config.dev.server : guildId)
        const destination = guild.channels.cache.get(client.dev ? config.dev.channel : channel) as TextChannel
        
        await destination.send({ embeds: [await createEmbed(page)] }).then(async () => {
            console.log("Lunch menu sent automatically")
        })
    }
    
    await browser.close()

    setTimeout(async () => {
        await sendWeekly(guildId, channel, client)
    }, 1000 * 60 * 60 * 4 /*should be 4 hrs*/ )
}

sendWeekly(config.commands.lunch.sendWeeklyGuild, config.commands.lunch.sendWeeklyChannel, client)