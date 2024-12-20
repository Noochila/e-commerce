"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.productRouter = express_1.default.Router();
const db_1 = require("../db");
const db_2 = __importDefault(require("../db"));
const zod_1 = __importDefault(require("zod"));
const productSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod_1.default.number({ required_error: "Price is required" }).min(0.01, "Minimum price is 0.01"),
    category: zod_1.default.string({ required_error: "Category required" }).min(3, "Minimum 3 characters required"),
    stockQuantity: zod_1.default.number({ required_error: "Stock Quantity is required" }).min(0, "Minimum 0 requried")
});
const productUpdateSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod_1.default.number().min(0.01, "Minimum price is 0.01").optional(),
    category: zod_1.default.string().min(3, "Minimum 3 characters required").optional(),
    stockQuantity: zod_1.default.number().min(0, "Minimum 0 requried").optional()
});
const validate = (schema) => async (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).json({
                message: error.errors.map(err => err.message).join(", ")
            });
        }
        else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
};
exports.productRouter.get("/", async (req, res) => {
    try {
        const products = await db_2.default.product.findMany({
            select: { id: true, name: true, price: true, category: true, stockQuantity: true }
        });
        res.json({ products });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.productRouter.get("/total", async (req, res) => {
    var _a;
    try {
        const quantity = await db_2.default.product.aggregate({
            _sum: {
                stockQuantity: true
            }
        });
        res.json({
            totalProducts: (_a = quantity._sum.stockQuantity) !== null && _a !== void 0 ? _a : 0
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.productRouter.post("/", validate(productSchema), async (req, res) => {
    try {
        const product = await db_2.default.product.create({
            data: req.body,
            select: { name: true, price: true, category: true, stockQuantity: true }
        });
        res.status(201).json({
            message: "Product created",
            product
        });
    }
    catch (e) {
        if (e instanceof db_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            res.status(400).json({ error: 'Product with that name already exists' });
        }
        else {
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});
exports.productRouter.put("/", validate(productUpdateSchema), async (req, res) => {
    const { name } = req.body;
    try {
        const product = await db_2.default.product.findUnique({ where: { name } });
        if (product) {
            const updatedProduct = await db_2.default.product.update({
                where: { name },
                data: req.body,
                select: { name: true, price: true, category: true, stockQuantity: true }
            });
            res.json({
                message: "Product updated successfully",
                product: updatedProduct
            });
        }
        else {
            res.status(404).json({ message: "Product not found" });
        }
    }
    catch (e) {
        if (e instanceof db_1.Prisma.PrismaClientKnownRequestError) {
            res.status(500).json({ error: 'Something went wrong' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
