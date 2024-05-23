-- CreateTable
CREATE TABLE "Block" (
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
    "signature" TEXT NOT NULL,
    "aggregateCommitId" INTEGER NOT NULL,
    CONSTRAINT "Block_aggregateCommitId_fkey" FOREIGN KEY ("aggregateCommitId") REFERENCES "AggregateCommit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AggregateCommit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL,
    "aggregationBits" TEXT,
    "certificateSignature" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Block_aggregateCommitId_key" ON "Block"("aggregateCommitId");
