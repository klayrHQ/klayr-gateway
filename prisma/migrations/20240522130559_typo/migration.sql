/*
  Warnings:

  - You are about to drop the column `validatorHash` on the `Block` table. All the data in the column will be lost.
  - Added the required column `validatorsHash` to the `Block` table without a default value. This is not possible if the table is not empty.

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
    "validatorsHash" TEXT NOT NULL,
    "generatorAddress" TEXT NOT NULL,
    "maxHeightPrevoted" INTEGER NOT NULL,
    "maxHeightGenerated" INTEGER NOT NULL,
    "impliesMaxPrevotes" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL
);
INSERT INTO "new_Block" ("assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "version") SELECT "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "maxHeightGenerated", "maxHeightPrevoted", "previousBlockID", "signature", "stateRoot", "timestamp", "transactionRoot", "version" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
PRAGMA foreign_key_check("Block");
PRAGMA foreign_keys=ON;
