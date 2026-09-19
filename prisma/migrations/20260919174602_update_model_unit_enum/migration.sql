/*
  Warnings:

  - You are about to drop the column `product` on the `ModelOperation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[modelId,operationId]` on the table `ModelOperation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modelId,stepOrder]` on the table `ModelOperation` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `unit` on the `Material` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `modelId` to the `ModelOperation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('KG', 'METR');

-- DropForeignKey
ALTER TABLE "ModelOperation" DROP CONSTRAINT "ModelOperation_product_fkey";

-- DropIndex
DROP INDEX "ModelOperation_product_operationId_key";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "unit",
ADD COLUMN     "unit" "MaterialUnit" NOT NULL;

-- AlterTable
ALTER TABLE "ModelOperation" DROP COLUMN "product",
ADD COLUMN     "modelId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ModelOperation_modelId_operationId_key" ON "ModelOperation"("modelId", "operationId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelOperation_modelId_stepOrder_key" ON "ModelOperation"("modelId", "stepOrder");

-- AddForeignKey
ALTER TABLE "ModelOperation" ADD CONSTRAINT "ModelOperation_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
