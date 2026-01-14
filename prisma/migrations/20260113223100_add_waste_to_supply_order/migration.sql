-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupplyOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
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
INSERT INTO "new_SupplyOrder" ("createdAt", "grandTotal", "id", "materialId", "quantity", "status", "supplierId", "tenantId", "totalPrice", "unit", "unitPrice", "updatedAt", "vatAmount", "vatRate") SELECT "createdAt", "grandTotal", "id", "materialId", "quantity", "status", "supplierId", "tenantId", "totalPrice", "unit", "unitPrice", "updatedAt", "vatAmount", "vatRate" FROM "SupplyOrder";
DROP TABLE "SupplyOrder";
ALTER TABLE "new_SupplyOrder" RENAME TO "SupplyOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
