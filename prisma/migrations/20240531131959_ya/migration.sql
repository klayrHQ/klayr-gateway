/*
  Warnings:

  - You are about to drop the `Signature` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `signatures` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Signature";
PRAGMA foreign_keys=on;

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
    "signatures" TEXT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    CONSTRAINT "Transaction_blockHeight_fkey" FOREIGN KEY ("blockHeight") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("blockHeight", "command", "fee", "id", "module", "nonce", "params", "senderPublicKey") SELECT "blockHeight", "command", "fee", "id", "module", "nonce", "params", "senderPublicKey" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_blockHeight_key" ON "Transaction"("blockHeight");
PRAGMA foreign_key_check("Transaction");
PRAGMA foreign_keys=ON;
