"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.orderRouter = express_1.default.Router();
const db_1 = __importDefault(require("../db"));
const db_2 = require("../db");
const zod_1 = __importDefault(require("zod"));
const orderSchema = zod_1.default.object({
    userId: zod_1.default.number().int().positive("User ID must be a positive integer"),
    products: zod_1.default.array(zod_1.default.object({
        productId: zod_1.default.number().int().positive("Product ID must be a positive integer"),
        quantity: zod_1.default.number().int().positive("Quantity must be a positive integer"),
    })).nonempty("Products array cannot be empty"),
});
const updateOrderSchema = zod_1.default.object({
    orderId: zod_1.default.number().int().positive("Order ID must be a positive integer"),
    products: zod_1.default.array(zod_1.default.object({
        productId: zod_1.default.number().int().min(0, "Product ID must be a positive integer"),
        quantity: zod_1.default.number().int().min(0, "Quantity must be a positive integer"),
    })).nonempty("Products array cannot be empty"),
});
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.default.ZodError) {
                res.status(400).json({
                    message: error.errors[0].message,
                });
                return;
            }
        }
    };
};
exports.orderRouter.post("/", validate(orderSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.user.findUnique({
            where: { id: req.body.userId },
        });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const products = req.body.products;
        for (const product of products) {
            const productDb = yield db_1.default.product.findUnique({
                where: { id: product.productId },
            });
            if (!productDb || productDb.stockQuantity < product.quantity) {
                res
                    .status(400)
                    .json({ message: `Product with ID ${product.productId} is out of stock or Not found` });
                return;
            }
        }
        try {
            yield db_1.default.$transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                const order = yield transaction.order.create({
                    data: {
                        userId: req.body.userId,
                        orderDate: new Date(),
                    },
                });
                for (const product of products) {
                    yield transaction.orderProduct.create({
                        data: {
                            orderId: order.id,
                            productId: product.productId,
                            quantity: product.quantity,
                        },
                    });
                    yield transaction.product.update({
                        where: { id: product.productId },
                        data: {
                            stockQuantity: {
                                decrement: product.quantity,
                            },
                        },
                    });
                }
                res.json({
                    message: "Order created successfully",
                    order,
                });
            }));
        }
        catch (transactionError) {
            console.error("Transaction error:", transactionError);
            res.status(500).json({ message: "Failed to create order" });
            return;
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}));
exports.orderRouter.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.body.orderId);
        const { products: updatedProducts } = req.body;
        const existingOrder = yield db_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                products: true, // Include associated OrderProduct entries
            },
        });
        if (!existingOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Map existing products by productId for quick lookup
        const existingProductsMap = new Map(existingOrder.products.map((p) => [p.productId, p]));
        // Start a transaction for the update operation
        yield db_1.default.$transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
            for (const updatedProduct of updatedProducts) {
                const existingProduct = existingProductsMap.get(updatedProduct.productId);
                if (existingProduct) {
                    // Revert stock quantity for the existing product
                    yield transaction.product.update({
                        where: { id: existingProduct.productId },
                        data: {
                            stockQuantity: {
                                increment: existingProduct.quantity,
                            },
                        },
                    });
                    // Remove the existing OrderProduct entry
                    yield transaction.orderProduct.delete({
                        where: { id: existingProduct.id },
                    });
                }
                // Skip creating new OrderProduct entry if quantity is zero
                if (updatedProduct.quantity === 0) {
                    continue;
                }
                // Validate stock availability for the new product
                const productDb = yield transaction.product.findUnique({
                    where: { id: updatedProduct.productId },
                });
                if (!productDb || productDb.stockQuantity < updatedProduct.quantity) {
                    throw new Error(`Product with ID ${updatedProduct.productId} is out of stock or not found.`);
                }
                // Decrement stock quantities for the new product
                yield transaction.product.update({
                    where: { id: updatedProduct.productId },
                    data: {
                        stockQuantity: {
                            decrement: updatedProduct.quantity,
                        },
                    },
                });
                // Add updated product to OrderProduct
                yield transaction.orderProduct.create({
                    data: {
                        orderId: existingOrder.id,
                        productId: updatedProduct.productId,
                        quantity: updatedProduct.quantity,
                    },
                });
            }
        }));
        res.json({ message: "Order updated successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error updating order:", error);
            res.status(500).json({ message: "Failed to update order", error: error.message });
        }
    }
}));
exports.orderRouter.get("/recent/:id?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id ? parseInt(req.params.id) : null;
        const orders = yield db_1.default.order.findMany({
            where: {
                userId: userId ? userId : undefined,
                orderDate: {
                    gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
            },
            select: {
                id: true,
                orderDate: true,
                userId: true,
                products: {
                    select: {
                        productId: true,
                        quantity: true,
                    },
                },
            },
        });
        res.json({
            orders: orders,
        });
    }
    catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({ error: "An error occurred while fetching recent orders" });
    }
}));
exports.orderRouter.get("/users/who-bought/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        const productExists = yield db_1.default.product.findUnique({
            where: { id: parseInt(productId) },
        });
        if (!productExists) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const users = yield db_1.default.orderProduct.findMany({
            where: {
                product: {
                    name: productExists.name
                }
            },
            select: {
                order: {
                    select: {
                        userId: true
                    }
                }
            }
        });
        const userIds = [...new Set(users.map((user) => user.order.userId))];
        res.status(200).json({ userIds });
    }
    catch (e) {
        console.error("Error grouping by productId and userId:", e);
        if (e instanceof db_2.Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({ error: "Something went wrong" });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}));
exports.orderRouter.get("/:id?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id ? parseInt(req.params.id) : null;
        const orders = yield db_1.default.order.findMany({
            where: userId ? { userId } : {},
            select: {
                id: true,
                orderDate: true,
                userId: true,
                products: {
                    select: {
                        productId: true,
                        quantity: true,
                    },
                },
            },
        });
        res.json({
            orders: orders,
        });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "An error occurred while fetching orders" });
    }
}));
