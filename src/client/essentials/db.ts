
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient()

export const database = {
    homeworkExists: prisma.homeworkExists as Prisma.homeworkExistsDelegate
}
