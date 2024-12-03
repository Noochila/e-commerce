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
const zod_1 = __importDefault(require("zod"));
const orderSchema = zod_1.default.object({
    userId: zod_1.default.number().int().positive("User ID must be a positive integer"),
    products: zod_1.default.array(zod_1.default.object({
        productId: zod_1.default.number().int().positive("Product ID must be a positive integer"),
        quantity: zod_1.default.number().int().positive("Quantity must be a positive integer"),
    })).nonempty("Products array cannot be empty"),
});
exports.orderRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield db_1.default.order.findMany({ select: { id: true, orderDate: true, userId: true, products: { select: { productId: true, quantity: true } } } });
    res.json({
        orders: orders
    });
}));
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
            }
        }
    };
};
exports.orderRouter.post("/", validate(orderSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user
        const user = yield db_1.default.user.findUnique({
            where: { id: req.body.userId },
        });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return; // Explicitly return to avoid further execution
        }
        // Validate products and check stock availability
        const products = req.body.products;
        for (const product of products) {
            const productDb = yield db_1.default.product.findUnique({
                where: { id: product.productId },
            });
            if (!productDb || productDb.stockQuantity < product.quantity) {
                res
                    .status(400)
                    .json({ message: `Product with ID ${product.productId} is out of stock or Not found` });
                return; // Explicitly return to avoid further execution
            }
        }
        try {
            // Create order and associated order products in a transaction
            yield db_1.default.$transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                // Create the order
                const order = yield transaction.order.create({
                    data: {
                        userId: req.body.userId,
                        orderDate: new Date(),
                    },
                });
                // Process each product and update stock within the transaction
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
                // Send success response
                res.json({
                    message: "Order created successfully",
                    order,
                });
            }));
        }
        catch (transactionError) {
            console.error("Transaction error:", transactionError);
            res.status(500).json({ message: "Failed to create order" });
            return; // Ensure no further processing
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
