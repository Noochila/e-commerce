import express from "express"
export const productRouter = express.Router()

import { Prisma } from "../db"
import db from "../db"


import zod from "zod"
const productSchema = zod.object({
    name: zod.string({required_error:"Product Name is required"}).min(3, "Minimum 3 characters required"),
    price: zod.number(),
    category: zod.string().min(3, "Minimum 3 characters required"),
    stockQuantity: zod.number()
})

const productUpdateSchema = zod.object({
    name: zod.string({ required_error: "Product Name is required" }).min(3, "Minimum 3 characters required"),
    price: zod.number().optional(),
    category: zod.string().min(3, "Minimum 3 characters required").optional(),
    stockQuantity: zod.number().optional()
})

const validate = (schema: zod.Schema) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const product = schema.parse(req.body)
        next()
    } catch (error) {
        if (error instanceof zod.ZodError) {
            res.status(400).json({
                message: error.errors[0].message
            })
        }
    }
}

productRouter.get("/", async (req, res) => {
    try {
        const products = await db.product.findMany({ select: {id:true, name: true, price: true, category: true, stockQuantity: true } })
        res.json({
            products: products
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({ error: 'Something went wrong' })
        }
    }

})



productRouter.post("/", validate(productSchema), async (req, res) => {
    try {
        const product = await db.product.create({ data: req.body, select: { name: true, price: true, category: true, stockQuantity: true } })
        res.json({
            message: "Product created",
            product: product
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                res.status(400).json({ error: 'Product with Product Name Already exists' })
            } else {
                res.status(400).json({ error: 'Something went wrong' })
            }
        }
    }

})

productRouter.put("/", validate(productUpdateSchema), async (req, res) => {

    const product = await db.product.findUnique({ where: { name: req.body.name } })

    if (product) {
        try {
            const updatedProduct = await db.product.update({ where: { name: req.body.name }, data: req.body, select: { name: true, price: true, category: true, stockQuantity: true } })

            res.json({
                message: "Product updated successfully",
                product: updatedProduct
            })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {

                res.status(400).json({ error: 'Something went wrong' })

            }
        }
    } else {
        res.status(400).json({
            message: "Product not found"
        })
    }
})