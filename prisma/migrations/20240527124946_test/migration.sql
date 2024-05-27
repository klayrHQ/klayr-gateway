-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NextBlockToSync" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL
);
INSERT INTO "new_NextBlockToSync" ("height", "id") SELECT "height", "id" FROM "NextBlockToSync";
DROP TABLE "NextBlockToSync";
ALTER TABLE "new_NextBlockToSync" RENAME TO "NextBlockToSync";
CREATE UNIQUE INDEX "NextBlockToSync_id_key" ON "NextBlockToSync"("id");
PRAGMA foreign_key_check("NextBlockToSync");
PRAGMA foreign_keys=ON;
