-- CreateTable
CREATE TABLE "user_watchlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "symbol" TEXT,
    "thesis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Research',
    "score" INTEGER NOT NULL DEFAULT 50,
    "risk" TEXT NOT NULL DEFAULT 'Medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_watchlist_items_userId_idx" ON "user_watchlist_items"("userId");

-- AddForeignKey
ALTER TABLE "user_watchlist_items" ADD CONSTRAINT "user_watchlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
