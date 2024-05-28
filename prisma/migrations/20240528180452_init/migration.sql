/*
  Warnings:

  - You are about to drop the column `aggregateCommitId` on the `Block` table. All the data in the column will be lost.
  - Added the required column `blockHeight` to the `AggregateCommit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AggregateCommit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL,
    "aggregationBits" TEXT NOT NULL,
    "certificateSignature" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    CONSTRAINT "AggregateCommit_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AggregateCommit" ("aggregationBits", "certificateSignature", "height", "id") SELECT "aggregationBits", "certificateSignature", "height", "id" FROM "AggregateCommit";
DROP TABLE "AggregateCommit";
ALTER TABLE "new_AggregateCommit" RENAME TO "AggregateCommit";
CREATE UNIQUE INDEX "AggregateCommit_blockHeight_key" ON "AggregateCommit"("blockHeight");
CREATE TABLE "new_Block" (
    "height" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "previousBlockID" TEXT NOT NULL,
    "stateRoot" TEXT NOT NULL,
    "assetRoot" TEXT NOT NULL,
    "eventRoot" TEXT NOT NULL,
    "transactionRoot" TEXT NOT NULL,
    "validatorsHash" TEXT NOT NULL,
    "generatorAddress" TEXT NOT NULL,
    "maxHeightPrevoted" INTEGER NOT NULL,
    "maxHeightGenerated" INTEGER NOT NULL,
    "impliesMaxPrevotes" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL
);
INSERT INTO "new_Block" ("assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version") SELECT "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
PRAGMA foreign_key_check("AggregateCommit");
PRAGMA foreign_key_check("Block");
PRAGMA foreign_keys=ON;
