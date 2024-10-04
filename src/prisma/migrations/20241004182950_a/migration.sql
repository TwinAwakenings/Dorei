/*
  Warnings:

  - Added the required column `guildId` to the `nicknameProtection` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_nicknameProtection" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL
);
INSERT INTO "new_nicknameProtection" ("userId") SELECT "userId" FROM "nicknameProtection";
DROP TABLE "nicknameProtection";
ALTER TABLE "new_nicknameProtection" RENAME TO "nicknameProtection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
