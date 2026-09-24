-- PayType enum + User.payType
CREATE TYPE "PayType" AS ENUM ('HOURLY', 'PIECE_RATE');
ALTER TABLE "User" ADD COLUMN "payType" "PayType" NOT NULL DEFAULT 'HOURLY';

-- Order.customerId becomes optional
ALTER TABLE "Order" ALTER COLUMN "customerId" DROP NOT NULL;

-- Color / Size catalog tables
CREATE TABLE "Color" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");

CREATE TABLE "Size" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Size_name_key" ON "Size"("name");

-- Seed catalog from existing OrderBatch data so it is not lost
INSERT INTO "Color" ("name") SELECT DISTINCT "color" FROM "OrderBatch";
INSERT INTO "Size" ("name") SELECT DISTINCT "size" FROM "OrderBatch";

-- Add new FK columns, backfill, then drop old free-text columns
ALTER TABLE "OrderBatch" ADD COLUMN "colorId" INTEGER;
ALTER TABLE "OrderBatch" ADD COLUMN "sizeId" INTEGER;

UPDATE "OrderBatch" ob SET "colorId" = c."id" FROM "Color" c WHERE c."name" = ob."color";
UPDATE "OrderBatch" ob SET "sizeId" = s."id" FROM "Size" s WHERE s."name" = ob."size";

ALTER TABLE "OrderBatch" ALTER COLUMN "colorId" SET NOT NULL;
ALTER TABLE "OrderBatch" ALTER COLUMN "sizeId" SET NOT NULL;

ALTER TABLE "OrderBatch" DROP COLUMN "color";
ALTER TABLE "OrderBatch" DROP COLUMN "size";

ALTER TABLE "OrderBatch" ADD CONSTRAINT "OrderBatch_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "OrderBatch" ADD CONSTRAINT "OrderBatch_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
