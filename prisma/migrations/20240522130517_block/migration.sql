/*
  Warnings:

  - Added the required column `assetRoot` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventRoot` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generatorAddress` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `impliesMaxPrevotes` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxHeightGenerated` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxHeightPrevoted` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousBlockID` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateRoot` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionRoot` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validatorHash` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "previousBlockID" TEXT NOT NULL,
    "stateRoot" TEXT NOT NULL,
    "assetRoot" TEXT NOT NULL,
    "eventRoot" TEXT NOT NULL,
    "transactionRoot" TEXT NOT NULL,
    "validatorHash" TEXT NOT NULL,
    "generatorAddress" TEXT NOT NULL,
    "maxHeightPrevoted" INTEGER NOT NULL,
    "maxHeightGenerated" INTEGER NOT NULL,
    "impliesMaxPrevotes" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL
);
INSERT INTO "new_Block" ("height", "id", "timestamp") SELECT "height", "id", "timestamp" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
PRAGMA foreign_key_check("Block");
PRAGMA foreign_keys=ON;
