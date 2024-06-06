-- CreateTable
CREATE TABLE "Validator" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "blsKey" TEXT NOT NULL,
    "proofOfPossession" TEXT NOT NULL,
    "generatorKey" TEXT NOT NULL,
    "lastGeneratedHeight" INTEGER NOT NULL,
    "isBanned" BOOLEAN NOT NULL,
    "reportMisbehaviorHeights" TEXT NOT NULL,
    "consecutiveMissedBlocks" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "lastCommissionIncreaseHeight" INTEGER NOT NULL,
    "sharingCoefficients" TEXT NOT NULL
);
