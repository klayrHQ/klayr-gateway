-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "publicKey" TEXT,
    "name" TEXT
);

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
    "reward" TEXT NOT NULL,
    "totalBurnt" INTEGER NOT NULL DEFAULT 0,
    "networkFee" INTEGER NOT NULL DEFAULT 0,
    "totalForged" INTEGER NOT NULL,
    CONSTRAINT "Block_generatorAddress_fkey" FOREIGN KEY ("generatorAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NextBlockToSync" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "minFee" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "signatures" TEXT NOT NULL,
    CONSTRAINT "Transaction_senderAddress_fkey" FOREIGN KEY ("senderAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Validator" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "blsKey" TEXT NOT NULL,
    "proofOfPossession" TEXT NOT NULL,
    "generatorKey" TEXT NOT NULL,
    "lastGeneratedHeight" INTEGER NOT NULL,
    "isBanned" BOOLEAN NOT NULL,
    "reportMisbehaviorHeights" TEXT NOT NULL,
    "consecutiveMissedBlocks" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "lastCommissionIncreaseHeight" INTEGER NOT NULL,
    "sharingCoefficients" TEXT NOT NULL,
    CONSTRAINT "Validator_address_fkey" FOREIGN KEY ("address") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_address_key" ON "Account"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Account_publicKey_key" ON "Account"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");

-- CreateIndex
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NextBlockToSync_id_key" ON "NextBlockToSync"("id");
