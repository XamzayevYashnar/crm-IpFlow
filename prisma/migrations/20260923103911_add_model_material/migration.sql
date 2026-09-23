-- CreateTable
CREATE TABLE "ModelMaterial" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantityNeeded" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ModelMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelMaterial_productId_materialId_key" ON "ModelMaterial"("productId", "materialId");

-- AddForeignKey
ALTER TABLE "ModelMaterial" ADD CONSTRAINT "ModelMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelMaterial" ADD CONSTRAINT "ModelMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
