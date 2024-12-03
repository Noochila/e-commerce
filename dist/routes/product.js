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
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.productRouter = express_1.default.Router();
const db_1 = require("../db");
const db_2 = __importDefault(require("../db"));
const zod_1 = __importDefault(require("zod"));
// Define schemas for validation
const productSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod_1.default.number(),
    category: zod_1.default.string().min(3, "Minimum 3 characters required"),
    stockQuantity: zod_1.default.number()
});
const productUpdateSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod_1.default.number().optional(),
    category: zod_1.default.string().min(3, "Minimum 3 characters required").optional(),
    stockQuantity: zod_1.default.number().optional()
});
// Validation middleware
const validate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
// GET all products
exports.productRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield db_2.default.product.findMany({
            select: { id: true, name: true, price: true, category: true, stockQuantity: true }
        });
        res.json({ products });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Something went wrong' });
    }
}));
// GET total stock quantity of products
exports.productRouter.get("/total", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const quantity = yield db_2.default.product.aggregate({
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
}));
// POST create a new product
exports.productRouter.post("/", validate(productSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield db_2.default.product.create({
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
}));
// PUT update an existing product by name
exports.productRouter.put("/", validate(productUpdateSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        const product = yield db_2.default.product.findUnique({ where: { name } });
        if (product) {
            const updatedProduct = yield db_2.default.product.update({
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
}));
