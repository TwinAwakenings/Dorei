import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, ForumChannel, PermissionFlagsBits, TextChannel, ThreadChannel } from "discord.js";
import { Dorei_Client } from "../../client/client";
import Command from "../../client/essentials/command";
import config from "../../config";
import { Category } from "../../enums/Category";
import { Edupage } from "edupage-api"
import "dotenv/config"
import fs from "fs"
import download from "download"



export default class HomeWorkCommand extends Command {
    constructor(client: Dorei_Client) {
        super(client, {
            name: "homework",
            description: "Check if homework exists",
            category: Category.Edu,
            cooldown: 30,
            cooldownFilteredUsers: [config.owner],
            dev: client.dev,
            nsfw: false,
            dm_permission: false,
            clientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.SendMessagesInThreads, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ManageChannels],
            userPermissions: [], //too lazy to fill
            options: [
                {
                    name: "show_teachers",
                    description: "Shows all teacher's names, id, shortNames",
                    required:  false,
                    type: ApplicationCommandOptionType.Boolean,

                }
            ]

        })
    }

    async execute(interaction: ChatInputCommandInteraction) {
        //for now its owner only
        if (interaction.user.id !== config.owner) {
            return interaction.reply({ content: "You are not allowed to use this command!", ephemeral: true })     
        }

        interaction.deferReply({ ephemeral: true })
        const showTeachers = interaction.options.getBoolean("show_teachers")
        const edupage = new Edupage()
        await edupage.login(process.env.edu_name, process.env.edu_password)
        
        if (showTeachers) {
            const data = await this.getTeachers(edupage)
            const formattedData = data.map(item => 
                `${item.firstName} ${item.lastName} (${item.shortName}) - ID: ${item.id}`
            ).join('\n')

            const chunks = this.chunkString(formattedData, 2000)

            await interaction.editReply("Here's the data:");

            for (const chunk of chunks) {
                await interaction.followUp(chunk);
            }
            return
        }

        const subjectChannels = {
            "APM": this.client.dev ? config.dev.testForum : "1278300352969703434",
            "SJL": this.client.dev ? config.dev.testForum : "1278300314197561388",
            "PCI": this.client.dev ? config.dev.testForum : "1278300413480796242",
            "API": this.client.dev ? config.dev.testForum : "1278306233065148469",
            "RUJ": this.client.dev ? config.dev.testForum : "1278300487493484606",
            "GRS": this.client.dev ? config.dev.testForum : "1278300433026387969",
            "WBN": this.client.dev ? config.dev.testForum : "1278300549745213450",
            "OKD": this.client.dev ? config.dev.testForum : "1278300596306186342",
            "ANJ": this.client.dev ? config.dev.testForum : "1278300460658458624",
            "OBN": this.client.dev ? config.dev.testForum : "1278300656393785345",
            "AFY": this.client.dev ? config.dev.testForum : "1278300523279290471",
            "PRO": this.client.dev ? config.dev.testForum : "1278300627017011302",

        }


        const teacherIdToName = await this.getTeachers(edupage).reduce((acc, teacher) => {
            acc[`Ucitel${teacher.id}`] = `${teacher.firstName} ${teacher.lastName}`;
            return acc;
        }, {})

    
        const homework = (await Promise.all(edupage.assignments.map(async hw => {
            const hwExists = await this.client.database.homeworkExists.findMany({ 
                where: { homeWorkId: hw.superId, title: hw.title } 
            }).catch(err => {
                console.error(err);
                return [];
            });
        
            
            if (hwExists.length > 0 && hwExists[0].title.includes(hw.title) && hwExists[0].homeWorkId.includes(hw.superId)) {
                return null;  // Return null for existing homework
            }
            
            await this.client.database.homeworkExists.create({
                data: {
                    homeWorkId: hw.superId,
                    title: hw.title,
                }
            });
            
            return {
                id: hw.id,
                superId: hw.superId,
                owner: {
                    id: hw.owner.id,
                    name: hw.owner.firstname + " " + hw.owner.lastname,
                    userString: hw.owner.userString,
                },
                subject: {
                    id: hw.subject.id,
                    name: hw.subject.name,
                    shortName: hw.subject.short,
                },
                title: hw.title,
                testId: hw.testId,
                type: hw.type,
            };
        }))).filter(hw => hw !== null);
        
        if (homework.length == 0) {
            return interaction.editReply({ content: "No homework found"})
        }

        /*
        homework
        {
            id: 'superid:16192',
            superId: '16192',
            owner: { id: '35430', name: 'Viola Fedinová', userString: 'Ucitel35430' },
            subject: { id: '47970', name: 'aplikovaná matematika', shortName: 'APM' },
            title: 'Kritériá klasifikácie ',
            testId: '423335',
            type: 'etestlesson'
        }
        */
        //console.log(homework)
        for (const hw of homework) {
            const forumId = subjectChannels[hw.subject.shortName];
            if (!forumId) {
                console.log(`No forum ID found for subject: ${hw.subject.shortName}`);
                continue;
            }

            const Guild = await this.client.guilds.fetch(this.client.dev ? config.dev.server : config.mainServer);
            if (!Guild) {
                console.log(`Guild not found for server: ${this.client.dev ? config.dev.server : config.mainServer}`);
                continue;
            }

            const forum: ForumChannel = await Guild.channels.cache.get(forumId) as ForumChannel

            //i have no idea why is this here
            if (hw.testId == undefined) {
                const title = hw.title.length > 100 ? hw.title.substring(0, 99) : hw.title;
                const noTestIdEmbed = new EmbedBuilder()
                    .setTitle(`SuperId: ${hw.superId}`)
                    .setDescription(hw.title)
                    .setColor("Random")
                await forum.threads.create({
                    name: title,
                    message: { embeds: [noTestIdEmbed] },
                });
                continue
            }

            const materialData: TestData = await this.getMaterial(edupage, hw)
            
            const title = hw.title.length > 100 ? hw.title.substring(0, 99) : hw.title;
            
            const forumEmbed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`Id: ${materialData.testid} SuperId: ${hw.superId}`)
                .setAuthor({ name: `${teacherIdToName[materialData.author.toString()]}` })
                .setDescription(`\n${hw.title}`)
                .setFooter({ text: materialData.timestamp.split(" ")[0] })


            const forumChall: ThreadChannel = await forum.threads.create({
                name: title,
                message: { embeds: [forumEmbed] },
            }).catch(err => {
                console.error(err);
                return null;
            });

            const messageChannel = Guild.channels.cache.get(forumChall.id) as TextChannel;

            const text: string[] = [];
            const files: { src: string; name: string }[] = [];
            const videos: string[] = []

            for (const id of materialData.cardids) {
                const data = materialData.cardsData[id]
                const homeworkData: QuestionETestWidget = await JSON.parse(data.content)

                for (const widget of homeworkData.widgets) {
                    //console.log(widget.widgetClass)
                    //console.log(widget.props)
                    if (widget.widgetClass == "TextETestWidget") {
                        /*
                        {
                            htmlText: '',
                            guid: '9va7jj4y',
                            isSecured: true,
                            _parsedHtmlText: ''
                        }
                            */
                        
                        const htmlText = this.stripHtmlTags(widget.props.htmlText)
                        const strippedParsedText = this.stripHtmlTags(widget.props._parsedHtmlText)

                        if (htmlText != undefined && htmlText.trim() !== '') {
                            text.push(htmlText)
                            //console.log(htmlText)
                        }

                        if (strippedParsedText != undefined && strippedParsedText.trim() !== '') {
                            text.push(strippedParsedText)
                            //console.log(strippedParsedText)
                        }
                    }

                    if (widget.widgetClass == "FileETestWidget") {
                        /*
                        {
                            files: [
                                {
                                src: '/elearning/ruqjzfpvimg?z%3AFvSTD3TRMhS6JtlE%2FEpb8SWK2lwntWaxfk2lSi2sNiVV9%2Bn%2FhUz9%2BiULBb8aOs%2BR',
                                name: '20240919_124657.jpg'
                                },
                                {
                                src: '/elearning/ruqjzfpvimg?z%3Ar76I3bX9ynHVnHf9CjOlBWHglk5mqFAGHjuV%2Bq8QDuSDc79mEfavoYM3vUesUGSB',
                                name: '20240919_124702.jpg'
                                }
                            ],
                            guid: 'pjzae29n'
                        }
                        */
                        // ... must be here
                        files.push(...widget.props.files.map((file) => {
                            return {
                                src: file.src,
                                name: file.name
                            }
                        }))
                    }

                    if (widget.widgetClass == "VideoETestWidget") {
                        /*
                        {
                            guid: '6hblc25z',
                            source: {
                                type: 'video/youtube',
                                src: 'https://www.youtube.com/watch?v=nEssBJsmR4k&t=0s'
                            }
                        }
                            */
                        videos.push(this.stripHtmlTags(widget.props.source.src))
                    }

                    if (widget.widgetClass == "ElaborationETestWidget") {

                    }
                }
            }
            //onsole.log(files)
          
            for (const str of this.removeDuplicateYouTubeLinks([...text, ...videos])) {
                if (str.length === 0) continue;

                const embed1 = new EmbedBuilder()
                    .setColor("Random")
                    .setTimestamp()
                    .setDescription(str + ".")
                await messageChannel.send({ embeds: [embed1] }).catch(err => {
                    console.error(err);
                    return
                });
            }
            
            for (const file of files) {
                //console.log(file.src)
                
                const fileUrl = "https://sps-snina.edupage.org" + file.src;
                await download(fileUrl, './', { filename: file.name });
                await messageChannel.send({ files: [{ attachment: `./${file.name}` }] }).then(() => {
                    fs.unlinkSync(`./${file.name}`);
                }).catch(err => {
                    console.error(err);
                    return
                });

            }

        }

        interaction.editReply("Processing completed.");
        edupage.exit();


    }
    private chunkString(str: string, length: number): string[] {
        const chunks = [];
        let i = 0;
        while (i < str.length) {
            chunks.push(str.slice(i, i + length));
            i += length;
        }
        return chunks;
    }

    private getTeachers(edupage) {

        return edupage.teachers.map(teacher => {
            return {firstName: teacher.firstname, lastName: teacher.lastname, shortName: teacher.short, id: teacher.id}
        })
    }
    
    private async getMaterial(edupage, homework) {
        const assignment = edupage.assignments.find((assig: Assignment) =>
            assig.title.startsWith(homework.title)
        );

        if (!assignment) {
            console.log(`Assignment not found for homework: ${homework.title}`);
            return;
        }

        const material = await assignment.getData().catch(async (err,) => {
           console.error(err);
        });
        
        if (!material?.materialData) {
            console.log(`Material data not found for homework: ${homework.title}`);
            return {};
        }
        return material.materialData
    }

    private stripHtmlTags(text: String): string {
        if (!text) return ""
        return text.toString().replace(/<[^>]*>/g, "")
    
    }

    private removeDuplicateYouTubeLinks(links: string[]): string[] {
        const videoIdsSet = new Set<string>();
        const uniqueLinks: string[] = [];
    
        // Iterate over the array and extract video IDs
        links.forEach(link => {
            const videoId = this.extractVideoId(link);
            if (videoId && !videoIdsSet.has(videoId)) {
                videoIdsSet.add(videoId);
                uniqueLinks.push(link);
            } else if (!videoId) {
                // If it's not a YouTube link, keep it as is
                uniqueLinks.push(link);
            }
        });
    
        return uniqueLinks;
    }

    private extractVideoId(link: string): string | null {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = link.match(regex);
        return match ? match[1] : null;
    }
}


export interface Edupage {
    user: Student[];
    seasons: any[]; // Replace 'any' with the appropriate type
    students: Student[];
    teachers: Teacher[];
    classes: Class[];
    classrooms: Classroom[];
    parents: Parent[];
    subjects: Subject[];
    periods: Period[];
    timetables: any[]; // Replace 'any' with the appropriate type
    timelineItems: any[]; // Replace 'any' with the appropriate type
    timeline: any[]; // Replace 'any' with the appropriate type
    plans: Plan[];
    assignments: Assignment[];
    homeworks: Homework[];
    tests: Test[];
    applications: Application[];
    ASC: ASC;
    year: number;
    baseUrl: string;
    grades: any[]; // Replace 'any' with the appropriate type
}

interface TestData {
    testid: string;
    userid: string;
    author: string;
    timestamp: string;
    name: string;
    short: string | null;
    description: string | null;
    keywords: string | null;
    options: {
      variants: any[][];
      gvariants: any[][];
      screenProps: { cardsPerScreen: string };
      studyCompetences: any[];
      standards: any[];
      variantsChanged: string;
    };
    cardids: string[];
    etestType: string;
    copyof: string | null;
    school_card: string | null;
    co_som: string;
    editable: boolean;
    cardsData: {
      [key: string]: {
        cardid: string;
        userid: string;
        author: string;
        keywords: string;
        competences: string | null;
        subjectid: string | null;
        content: string;
        timestamp: string;
        stav: string;
        copyof: string | null;
        school_card: string | null;
        visibility: string;
        has_question: string;
        moredata: string | null;
        copyof_diff: string | null;
        histid: string;
        groupid: string | null;
        license: string | null;
        editable: boolean;
      };
    };
  }

export interface Student {
    edupage: Edupage;
    dateFrom: Date;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: 'M' | 'F';
    id: string;
    userString: string;
    isOut: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
    number: number;
    numberInClass: number;
    parent1Id: string;
    parent2Id: string;
    parent3Id: string;
    parent1: Parent | undefined;
    parent2: Parent | undefined;
    parent3: Parent | null;
    class: Class;
}

export interface Teacher {
    edupage: Edupage;
    dateFrom: Date;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: 'M' | 'F';
    id: string;
    userString: string;
    isOut: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
    cb_hidden: number;
    short: string;
    classroom: Classroom | undefined;
}

export interface Parent {
    edupage: Edupage;
    dateFrom: Date | null;
    dateTo: Date | null;
    firstname: string;
    lastname: string;
    gender: 'M' | 'F';
    id: string;
    userString: string;
    isOut?: boolean;
    origin: string;
    credentials: any; // Replace 'any' with the appropriate type
    cookies: any; // Replace 'any' with the appropriate type
    isLoggedIn: boolean;
    email: string | null;
}

export interface Period {
    id: string;
    name: string;
    short: string;
    startTime: string;
    endTime: string;
}

export interface Subject {
    id: string;
    name: string;
    short: string;
}

export interface Classroom {
    edupage: Edupage;
    cb_hidden: boolean;
    id: string;
    name: string;
    short: string;
}

export interface Class {
    edupage: Edupage;
    grade: number;
    id: string;
    name: string;
    short: string;
    classroom: Classroom;
    teacher: Teacher;
    teacher2?: Teacher;
}

export interface Application {
    edupage: Edupage;
    id: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    name: string;
    parameters: string[];
    availableFor: string;
    isEnabled: boolean;
    isTextOptional: boolean;
    isAdvancedWorkflow: boolean;
    isSimpleWorkflow: boolean;
}

export interface Plan {
    edupage: Edupage;
    id: string;
    subjectId: string;
    customClassId: string;
    customName: string;
    changedDate: Date;
    year: number;
    settings: any; // Replace 'any' with the appropriate type
    isPublic: boolean;
    state: string;
    isValid: boolean;
    approvedDate: Date | null;
    isApproved: boolean;
    otherId: any; // Replace 'any' with the appropriate type
    topicsCount: number;
    taughtCount: number;
    standardsCount: number;
    timetableGroup: string;
    season: any; // Replace 'any' with the appropriate type
    name: string;
    classOrdering: number;
    isEntireClass: boolean;
    subject: Subject;
    classes: Class[][];
    teacher: Teacher;
    teachers: Teacher[][];
    students: (Student | undefined)[][];
}

export interface ASC { }

export interface Assignment {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string | null;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Student;
    grades: any[]; // Replace 'any' with the appropriate type
}

export interface Homework {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Student;
    grades: any[]; // Replace 'any' with the appropriate type
}

export interface Test {
    edupage: Edupage;
    id: string;
    superId: string;
    owner: Teacher;
    subject: Subject;
    title: string;
    details: string;
    creationDate: Date;
    fromDate: Date;
    toDate: Date;
    duration: number;
    period: Period | null;
    testId: string;
    type: string;
    hwkid: string | null;
    cardsCount: number;
    answerCardsCount: number;
    state: string;
    isSeen: boolean;
    comment: string;
    result: string;
    isFinished: boolean;
    stateUpdatedDate: Date;
    stateUpdatedBy: Teacher;
    grades: any[]; // Replace 'any' with the appropriate type
}

export interface Lesson {
    edupage: Edupage;
    id: string;
    lid: string;
    date: string;
    homeworkNote: undefined | string;
    absentNote: undefined | string;
    curriculum: null | any; // Modify type according to actual data
    onlineLessonURL: null | string;
    isOnlineLesson: boolean;
    period: Period;
    subject: Subject;
    classes: Class[];
    classrooms: Classroom[];
    students: Student[];
    teachers: Teacher[];
    assignments: Assignment[];
}

export interface ITimetable {
    edupage: Edupage;
    date: string;
    lessons: Lesson[];
    week: number;
}
interface WidgetProps {
    [key: string]: any;
}

interface Widget {
    widgetid: string;
    widgetClass: string;
    props: WidgetProps;
    widgets: (FileETestWidget | TextETestWidget | QuestionETestWidget)[];
    cardid?: string;
}

interface FileETestWidgetProps extends WidgetProps {
    src: string;
    name: string;
    thumb_l?: string;
    thumb_m?: string;
    thumb_s?: string;
    type: string;
    width?: number;
    height?: number;
    ts?: string;
    id: number;
    aspectRatio?: number;
    cssFlex?: string;
}

interface FileETestWidget extends Widget {
    props: FileETestWidgetProps;
}

interface TextETestWidgetProps extends WidgetProps {
    htmlText: string;
    guid: string;
    isSecured?: boolean;
    _parsedHtmlText?: string;
}

interface TextETestWidget extends Widget {
    props: TextETestWidgetProps;
}

interface QuestionETestWidget extends Widget {
    widgets: (FileETestWidget | TextETestWidget)[];
}
