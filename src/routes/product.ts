import express from "express";
export const productRouter = express.Router();
import { Prisma } from "../db";
import db from "../db";
import zod from "zod";

// Define schemas for validation
const productSchema = zod.object({
    name: zod.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod.number(),
    category: zod.string().min(3, "Minimum 3 characters required"),
    stockQuantity: zod.number()
});

const productUpdateSchema = zod.object({
    name: zod.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod.number().optional(),
    category: zod.string().min(3, "Minimum 3 characters required").optional(),
    stockQuantity: zod.number().optional()
});

// Validation middleware
const validate = (schema: zod.ZodType<any, any, any>) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof zod.ZodError) {
            res.status(400).json({
                message: error.errors.map(err => err.message).join(", ")
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
};

// GET all products
productRouter.get("/", async (req, res) => {
    try {
        const products = await db.product.findMany({
            select: { id: true, name: true, price: true, category: true, stockQuantity: true }
        });
        res.json({ products });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// GET total stock quantity of products
productRouter.get("/total", async (req, res) => {
    try {
        const quantity = await db.product.aggregate({
            _sum: {
                stockQuantity: true
            }
        });
        res.json({
            totalProducts: quantity._sum.stockQuantity ?? 0
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// POST create a new product
productRouter.post("/", validate(productSchema), async (req, res) => {
    try {
        const product = await db.product.create({
            data: req.body,
            select: { name: true, price: true, category: true, stockQuantity: true }
        });
        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            res.status(400).json({ error: 'Product with that name already exists' });
        } else {
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});

// PUT update an existing product by name
productRouter.put("/", validate(productUpdateSchema), async (req, res) => {
    const { name } = req.body;
    try {
        const product = await db.product.findUnique({ where: { name } });

        if (product) {
            const updatedProduct = await db.product.update({
                where: { name },
                data: req.body,
                select: { name: true, price: true, category: true, stockQuantity: true }
            });

            res.json({
                message: "Product updated successfully",
                product: updatedProduct
            });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(500).json({ error: 'Something went wrong' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
