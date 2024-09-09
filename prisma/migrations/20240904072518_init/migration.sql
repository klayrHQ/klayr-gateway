-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL DEFAULT '0',
    "publicKey" TEXT,
    "name" TEXT,
    "stakes" JSONB[],

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "height" INTEGER NOT NULL,
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
    "numberOfEvents" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "reward" TEXT NOT NULL,
    "totalBurnt" BIGINT NOT NULL DEFAULT 0,
    "networkFee" BIGINT NOT NULL DEFAULT 0,
    "totalForged" BIGINT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("height")
);

-- CreateTable
CREATE TABLE "ChainEvents" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT,
    "topics" TEXT,
    "index" INTEGER,
    "transactionID" TEXT,

    CONSTRAINT "ChainEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextBlockToSync" (
    "id" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "NextBlockToSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "minFee" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "signatures" TEXT[],
    "index" INTEGER NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientAddress" TEXT,
    "executionStatus" TEXT DEFAULT 'pending',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validator" (
    "address" TEXT NOT NULL,
    "totalStake" BIGINT NOT NULL DEFAULT 0,
    "selfStake" BIGINT NOT NULL DEFAULT 0,
    "validatorWeight" BIGINT NOT NULL DEFAULT 0,
    "blockReward" BIGINT NOT NULL DEFAULT 0,
    "totalRewards" BIGINT NOT NULL DEFAULT 0,
    "totalSharedRewards" BIGINT NOT NULL DEFAULT 0,
    "totalSelfStakeRewards" BIGINT NOT NULL DEFAULT 0,
    "generatedBlocks" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "blsKey" TEXT,
    "proofOfPossession" TEXT,
    "generatorKey" TEXT,
    "lastGeneratedHeight" INTEGER,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "reportMisbehaviorHeights" TEXT,
    "punishmentPeriods" TEXT,
    "consecutiveMissedBlocks" INTEGER,
    "commission" INTEGER,
    "lastCommissionIncreaseHeight" INTEGER,
    "sharingCoefficients" TEXT,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("address")
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

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_generatorAddress_fkey" FOREIGN KEY ("generatorAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainEvents" ADD CONSTRAINT "ChainEvents_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainEvents" ADD CONSTRAINT "ChainEvents_transactionID_fkey" FOREIGN KEY ("transactionID") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderAddress_fkey" FOREIGN KEY ("senderAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientAddress_fkey" FOREIGN KEY ("recipientAddress") REFERENCES "Account"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
