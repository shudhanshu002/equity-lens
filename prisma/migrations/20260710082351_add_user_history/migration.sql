-- CreateEnum
CREATE TYPE "HistoryItemType" AS ENUM ('RESEARCH', 'COMPARISON');

-- CreateTable
CREATE TABLE "user_history_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "HistoryItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "symbol" TEXT,
    "decision" TEXT,
    "score" INTEGER,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_history_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_history_items_userId_idx" ON "user_history_items"("userId");

-- CreateIndex
CREATE INDEX "user_history_items_type_idx" ON "user_history_items"("type");

-- AddForeignKey
ALTER TABLE "user_history_items" ADD CONSTRAINT "user_history_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
