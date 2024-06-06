-- CreateTable
CREATE TABLE "Generator" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
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
    "reward" TEXT NOT NULL,
    CONSTRAINT "Block_generatorAddress_fkey" FOREIGN KEY ("generatorAddress") REFERENCES "Validator" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("aggregateCommit", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "isFinal", "maxHeightGenerated", "maxHeightPrevoted", "numberOfAssets", "numberOfTransactions", "previousBlockID", "reward", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version") SELECT "aggregateCommit", "assetRoot", "eventRoot", "generatorAddress", "height", "id", "impliesMaxPrevotes", "isFinal", "maxHeightGenerated", "maxHeightPrevoted", "numberOfAssets", "numberOfTransactions", "previousBlockID", "reward", "signature", "stateRoot", "timestamp", "transactionRoot", "validatorsHash", "version" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Generator_address_key" ON "Generator"("address");
