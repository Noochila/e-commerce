-- DropIndex
DROP INDEX "Order_userId_id_idx";

-- DropIndex
DROP INDEX "OrderProduct_orderId_productId_idx";

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_id_idx" ON "Order"("id");

-- CreateIndex
CREATE INDEX "Order_orderDate_userId_idx" ON "Order"("orderDate", "userId");

-- CreateIndex
CREATE INDEX "OrderProduct_orderId_idx" ON "OrderProduct"("orderId");

-- CreateIndex
CREATE INDEX "OrderProduct_productId_idx" ON "OrderProduct"("productId");

-- CreateIndex
CREATE INDEX "Product_id_idx" ON "Product"("id");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");
