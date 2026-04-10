/*
  Warnings:

  - You are about to drop the column `infojobsPassword` on the `Profile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cvContent" TEXT,
    "cvFileName" TEXT,
    "titulaciones" TEXT,
    "experiencia" TEXT,
    "linkedinEmail" TEXT,
    "linkedinPassword" TEXT,
    "linkedinCookies" TEXT,
    "infojobsEmail" TEXT,
    "infojobsToken" TEXT,
    "infojobsTokenExpiry" DATETIME,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("createdAt", "cvContent", "cvFileName", "experiencia", "id", "infojobsEmail", "linkedinCookies", "linkedinEmail", "linkedinPassword", "preferences", "titulaciones", "updatedAt", "userId") SELECT "createdAt", "cvContent", "cvFileName", "experiencia", "id", "infojobsEmail", "linkedinCookies", "linkedinEmail", "linkedinPassword", "preferences", "titulaciones", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
