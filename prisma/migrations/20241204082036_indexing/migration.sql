-- CreateIndex
CREATE INDEX "Order_userId_id_idx" ON "Order"("userId", "id");

-- CreateIndex
CREATE INDEX "OrderProduct_orderId_productId_idx" ON "OrderProduct"("orderId", "productId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");
