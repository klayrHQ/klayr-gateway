/*
  Warnings:

  - The primary key for the `Block` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "signature" TEXT NOT NULL,
    "aggregateCommitId" INTEGER NOT NULL,
    CONSTRAINT "Block_aggregateCommitId_fkey" FOREIGN KEY ("aggregateCommitId") REFERENCES "AggregateCommit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("aggregateCommitId", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version") SELECT "aggregateCommitId", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
CREATE UNIQUE INDEX "Block_aggregateCommitId_key" ON "Block"("aggregateCommitId");
PRAGMA foreign_key_check("Block");
PRAGMA foreign_keys=ON;
