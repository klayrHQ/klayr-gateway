/*
  Warnings:

  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `txID` on the `Transaction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "senderPublicKey" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "signatures" TEXT NOT NULL,
    CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("command", "fee", "height", "id", "module", "nonce", "params", "senderPublicKey", "signatures") SELECT "command", "fee", "height", "id", "module", "nonce", "params", "senderPublicKey", "signatures" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
