/*
  Warnings:

  - Added the required column `txID` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "senderPublicKey" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "signatures" TEXT NOT NULL,
    "txID" TEXT NOT NULL,
    CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block" ("height") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("command", "fee", "height", "id", "module", "nonce", "params", "senderPublicKey", "signatures") SELECT "command", "fee", "height", "id", "module", "nonce", "params", "senderPublicKey", "signatures" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
