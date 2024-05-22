-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_id_key" ON "Block"("id");
