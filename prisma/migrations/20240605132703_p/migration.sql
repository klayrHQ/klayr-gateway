/*
  Warnings:

  - You are about to drop the column `numberOfEvents` on the `Block` table. All the data in the column will be lost.

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
    "aggregateCommit" TEXT NOT NULL,
    "numberOfTransactions" INTEGER NOT NULL,
    "numberOfAssets" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "reward" TEXT NOT NULL
);
INSERT INTO "new_Block" ("aggregateCommit", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "isFinal", "maxHeightGenerated", "maxHeightPrevoted", "numberOfAssets", "numberOfTransactions", "previousBlockID", "reward", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version") SELECT "aggregateCommit", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "isFinal", "maxHeightGenerated", "maxHeightPrevoted", "numberOfAssets", "numberOfTransactions", "previousBlockID", "reward", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
PRAGMA foreign_key_check("Block");
PRAGMA foreign_keys=ON;
