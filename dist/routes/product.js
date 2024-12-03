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
const validate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).json({
                message: error.errors[0].message
            });
        }
    }
});
exports.productRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield db_2.default.product.findMany({ select: { id: true, name: true, price: true, category: true, stockQuantity: true } });
        res.json({
            products: products
        });
    }
    catch (e) {
        if (e instanceof db_1.Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({ error: 'Something went wrong' });
        }
    }
}));
exports.productRouter.post("/", validate(productSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield db_2.default.product.create({ data: req.body, select: { name: true, price: true, category: true, stockQuantity: true } });
        res.json({
            message: "Product created",
            product: product
        });
    }
    catch (e) {
        if (e instanceof db_1.Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                res.status(400).json({ error: 'Product with Product Name Already exists' });
            }
            else {
                res.status(400).json({ error: 'Something went wrong' });
            }
        }
    }
}));
exports.productRouter.put("/", validate(productUpdateSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield db_2.default.product.findUnique({ where: { name: req.body.name } });
    if (product) {
        try {
            const updatedProduct = yield db_2.default.product.update({ where: { name: req.body.name }, data: req.body, select: { name: true, price: true, category: true, stockQuantity: true } });
            res.json({
                message: "Product updated successfully",
                product: updatedProduct
            });
        }
        catch (e) {
            if (e instanceof db_1.Prisma.PrismaClientKnownRequestError) {
                res.status(400).json({ error: 'Something went wrong' });
            }
        }
    }
    else {
        res.status(400).json({
            message: "Product not found"
        });
    }
}));
