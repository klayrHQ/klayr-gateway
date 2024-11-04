-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL DEFAULT '0',
    "publicKey" TEXT,
    "name" TEXT,
    "description" TEXT,
    "totalBalance" BIGINT NOT NULL DEFAULT 0,
    "availableBalance" BIGINT NOT NULL DEFAULT 0,
    "lockedBalance" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "App" (
    "chainID" TEXT NOT NULL,
    "chainName" TEXT NOT NULL,
    "displayName" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'activated',
    "description" TEXT NOT NULL,
    "networkType" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "genesisURL" TEXT NOT NULL,
    "projectPage" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("chainID")
);

-- CreateTable
CREATE TABLE "ServiceURL" (
    "id" SERIAL NOT NULL,
    "http" TEXT NOT NULL,
    "ws" TEXT NOT NULL,
    "apiCertificatePublicKey" TEXT,
    "appChainID" TEXT NOT NULL,

    CONSTRAINT "ServiceURL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logo" (
    "id" SERIAL NOT NULL,
    "png" TEXT NOT NULL,
    "svg" TEXT NOT NULL,
    "appChainID" TEXT NOT NULL,

    CONSTRAINT "Logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Explorer" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "txnPage" TEXT NOT NULL,
    "appChainID" TEXT NOT NULL,

    CONSTRAINT "Explorer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppNode" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "maintainer" TEXT,
    "apiCertificatePublicKey" TEXT,
    "appChainID" TEXT NOT NULL,

    CONSTRAINT "AppNode_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "BlockchainApp" (
    "chainID" TEXT NOT NULL,
    "chainName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT,
    "lastCertificateHeight" INTEGER,
    "lastUpdated" INTEGER,
    "escrowedKLY" TEXT,

    CONSTRAINT "BlockchainApp_pkey" PRIMARY KEY ("chainID")
);

-- CreateTable
CREATE TABLE "Escrow" (
    "id" SERIAL NOT NULL,
    "tokenID" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "blockchainAppId" TEXT NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cachedSchemas" (
    "id" INTEGER NOT NULL,
    "schema" TEXT NOT NULL,
    "metaData" TEXT NOT NULL,
    "registeredModules" TEXT[],
    "moduleCommands" TEXT[],

    CONSTRAINT "cachedSchemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainEvents" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT,
    "topics" TEXT[],
    "index" INTEGER,
    "transactionID" TEXT,

    CONSTRAINT "ChainEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenConstants" (
    "id" INTEGER NOT NULL,
    "userAccountInitializationFee" TEXT NOT NULL,
    "escrowAccountInitializationFee" TEXT NOT NULL,

    CONSTRAINT "TokenConstants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextBlockToSync" (
    "id" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "NextBlockToSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stake" (
    "validatorAddress" TEXT NOT NULL,
    "staker" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("staker","validatorAddress")
);

-- CreateTable
CREATE TABLE "Token" (
    "tokenID" TEXT NOT NULL,
    "chainID" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayDenom" TEXT NOT NULL,
    "baseDenom" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("tokenID")
);

-- CreateTable
CREATE TABLE "TokenLogo" (
    "id" SERIAL NOT NULL,
    "png" TEXT NOT NULL,
    "svg" TEXT NOT NULL,
    "tokenID" TEXT NOT NULL,

    CONSTRAINT "TokenLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DenomUnit" (
    "id" SERIAL NOT NULL,
    "denom" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "aliases" TEXT[],
    "tokenID" TEXT NOT NULL,

    CONSTRAINT "DenomUnit_pkey" PRIMARY KEY ("id")
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
    "receivingChainID" TEXT,
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
CREATE UNIQUE INDEX "App_chainID_key" ON "App"("chainID");

-- CreateIndex
CREATE UNIQUE INDEX "Logo_appChainID_key" ON "Logo"("appChainID");

-- CreateIndex
CREATE UNIQUE INDEX "Block_height_key" ON "Block"("height");

-- CreateIndex
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainApp_chainID_key" ON "BlockchainApp"("chainID");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainApp_chainName_key" ON "BlockchainApp"("chainName");

-- CreateIndex
CREATE UNIQUE INDEX "TokenConstants_id_key" ON "TokenConstants"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NextBlockToSync_id_key" ON "NextBlockToSync"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenID_key" ON "Token"("tokenID");

-- CreateIndex
CREATE UNIQUE INDEX "TokenLogo_tokenID_key" ON "TokenLogo"("tokenID");

-- AddForeignKey
ALTER TABLE "ServiceURL" ADD CONSTRAINT "ServiceURL_appChainID_fkey" FOREIGN KEY ("appChainID") REFERENCES "App"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_appChainID_fkey" FOREIGN KEY ("appChainID") REFERENCES "App"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Explorer" ADD CONSTRAINT "Explorer_appChainID_fkey" FOREIGN KEY ("appChainID") REFERENCES "App"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNode" ADD CONSTRAINT "AppNode_appChainID_fkey" FOREIGN KEY ("appChainID") REFERENCES "App"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_generatorAddress_fkey" FOREIGN KEY ("generatorAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_blockchainAppId_fkey" FOREIGN KEY ("blockchainAppId") REFERENCES "BlockchainApp"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainEvents" ADD CONSTRAINT "ChainEvents_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainEvents" ADD CONSTRAINT "ChainEvents_transactionID_fkey" FOREIGN KEY ("transactionID") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_staker_fkey" FOREIGN KEY ("staker") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_validatorAddress_fkey" FOREIGN KEY ("validatorAddress") REFERENCES "Validator"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_chainID_fkey" FOREIGN KEY ("chainID") REFERENCES "App"("chainID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenLogo" ADD CONSTRAINT "TokenLogo_tokenID_fkey" FOREIGN KEY ("tokenID") REFERENCES "Token"("tokenID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DenomUnit" ADD CONSTRAINT "DenomUnit_tokenID_fkey" FOREIGN KEY ("tokenID") REFERENCES "Token"("tokenID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderAddress_fkey" FOREIGN KEY ("senderAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientAddress_fkey" FOREIGN KEY ("recipientAddress") REFERENCES "Account"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
