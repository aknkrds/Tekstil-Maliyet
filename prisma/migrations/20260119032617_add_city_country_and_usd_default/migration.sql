-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "billingCity" TEXT;
ALTER TABLE "Customer" ADD COLUMN "billingCountry" TEXT;
ALTER TABLE "Customer" ADD COLUMN "contactName" TEXT;
ALTER TABLE "Customer" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Customer" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Customer" ADD COLUMN "shippingAddress" TEXT;
ALTER TABLE "Customer" ADD COLUMN "shippingCity" TEXT;
ALTER TABLE "Customer" ADD COLUMN "shippingCountry" TEXT;
ALTER TABLE "Customer" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "Customer" ADD COLUMN "taxOffice" TEXT;

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "productType" TEXT NOT NULL,
    "fabricType" TEXT NOT NULL,
    "offerDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadlineDate" DATETIME,
    "deadline" INTEGER NOT NULL,
    "fabricConsumption" DECIMAL NOT NULL,
    "fabricUnit" TEXT NOT NULL,
    "fabricPrice" DECIMAL NOT NULL,
    "fabricCurrency" TEXT NOT NULL,
    "accessory1Type" TEXT,
    "accessory1Consumption" DECIMAL,
    "accessory1Unit" TEXT,
    "accessory1Price" DECIMAL,
    "accessory1Currency" TEXT,
    "accessory2Type" TEXT,
    "accessory2Consumption" DECIMAL,
    "accessory2Unit" TEXT,
    "accessory2Price" DECIMAL,
    "accessory2Currency" TEXT,
    "accessory3Type" TEXT,
    "accessory3Consumption" DECIMAL,
    "accessory3Unit" TEXT,
    "accessory3Price" DECIMAL,
    "accessory3Currency" TEXT,
    "cuttingPrice" DECIMAL NOT NULL,
    "cuttingCurrency" TEXT NOT NULL,
    "sewingPrice" DECIMAL NOT NULL,
    "sewingCurrency" TEXT NOT NULL,
    "ironingPrice" DECIMAL NOT NULL,
    "ironingCurrency" TEXT NOT NULL,
    "shippingPrice" DECIMAL NOT NULL,
    "shippingCurrency" TEXT NOT NULL,
    "profitAmount" DECIMAL NOT NULL,
    "profitCurrency" TEXT NOT NULL,
    "baseAmount" DECIMAL,
    "marginType" TEXT NOT NULL DEFAULT 'PERCENT',
    "marginValue" DECIMAL NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "vatRate" DECIMAL NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'TEKLIF_OLUSTURULDU',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "price" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stock" DECIMAL NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("createdAt", "currency", "id", "name", "price", "stock", "tenantId", "unit", "updatedAt") SELECT "createdAt", "currency", "id", "name", "price", "stock", "tenantId", "unit", "updatedAt" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validUntil" DATETIME,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("code", "createdAt", "currency", "customerId", "id", "status", "tenantId", "totalAmount", "updatedAt", "validUntil") SELECT "code", "createdAt", "currency", "customerId", "id", "status", "tenantId", "totalAmount", "updatedAt", "validUntil" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "manualRecipe" JSONB,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "laborCost" DECIMAL NOT NULL DEFAULT 0,
    "overheadCost" DECIMAL NOT NULL DEFAULT 0,
    "profitMargin" DECIMAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("code", "createdAt", "id", "laborCost", "name", "overheadCost", "profitMargin", "tenantId", "updatedAt") SELECT "code", "createdAt", "id", "laborCost", "name", "overheadCost", "profitMargin", "tenantId", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_SupplyOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "vatRate" DECIMAL NOT NULL,
    "totalPrice" DECIMAL NOT NULL,
    "vatAmount" DECIMAL NOT NULL,
    "grandTotal" DECIMAL NOT NULL,
    "wasteAmount" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplyOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplyOrder_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplyOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupplyOrder" ("createdAt", "grandTotal", "id", "materialId", "quantity", "status", "supplierId", "tenantId", "totalPrice", "unit", "unitPrice", "updatedAt", "vatAmount", "vatRate", "wasteAmount") SELECT "createdAt", "grandTotal", "id", "materialId", "quantity", "status", "supplierId", "tenantId", "totalPrice", "unit", "unitPrice", "updatedAt", "vatAmount", "vatRate", "wasteAmount" FROM "SupplyOrder";
DROP TABLE "SupplyOrder";
ALTER TABLE "new_SupplyOrder" RENAME TO "SupplyOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
