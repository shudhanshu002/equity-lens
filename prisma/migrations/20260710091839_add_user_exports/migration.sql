-- CreateTable
CREATE TABLE "user_export_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "description" TEXT,
    "payload" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_export_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_export_items_userId_idx" ON "user_export_items"("userId");

-- CreateIndex
CREATE INDEX "user_export_items_type_idx" ON "user_export_items"("type");

-- CreateIndex
CREATE INDEX "user_export_items_format_idx" ON "user_export_items"("format");

-- AddForeignKey
ALTER TABLE "user_export_items" ADD CONSTRAINT "user_export_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
