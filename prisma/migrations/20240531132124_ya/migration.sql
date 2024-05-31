/*
  Warnings:

  - You are about to drop the column `signatures` on the `Transaction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "senderPublicKey" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    CONSTRAINT "Transaction_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("blockHeight", "command", "fee", "id", "module", "nonce", "params", "senderPublicKey") SELECT "blockHeight", "command", "fee", "id", "module", "nonce", "params", "senderPublicKey" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_blockHeight_key" ON "Transaction"("blockHeight");
PRAGMA foreign_key_check("Transaction");
PRAGMA foreign_keys=ON;
