-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    CONSTRAINT "Asset_height_fkey" FOREIGN KEY ("height") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Block" (
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

-- CreateTable
CREATE TABLE "NextBlockToSync" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "senderPublicKey" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "signatures" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    CONSTRAINT "Transaction_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");

-- CreateIndex
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NextBlockToSync_id_key" ON "NextBlockToSync"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_blockHeight_key" ON "Transaction"("blockHeight");
