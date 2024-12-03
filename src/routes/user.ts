import express, { NextFunction } from "express"
export const userRouter = express.Router()
import db from "../db"
import zod, { any } from "zod"
import { Prisma } from "../db"

const UserSchema = zod.object({
    name: zod.string(),
    email: zod.string().email("Invalid email"),
    password: zod.string().min(6, "Password too short"),
    phone: zod.string().min(10, "Invalid phone number")

})

const UserUpdateSchema = zod.object({
    name: zod.string().optional(),
    email: zod.string().email("Invalid email"),
    password: zod.string().min(6, "Password too short").optional(),
    phone: zod.string().min(10, "Invalid phone number").optional()

})

const validate = (schema: Zod.Schema) => async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const user = schema.parse(req.body)
        next()
    } catch (error) {
        if (error instanceof zod.ZodError) {
            res.status(400).json({
                message: error.errors[0].message,
            })
        }
    }
}


userRouter.put("/", validate(UserUpdateSchema), async (req, res) => {

    const user = await db.user.findUnique({ where: { email: req.body.email } })

    if (user) {
        try {
            const updatedUser = await db.user.update({ where: { email: req.body.email }, data: req.body, select: { id: true, name: true, email: true, phone: true } })
            res.json({
                message: "User updated successfully",
                user: updatedUser
            })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {

                res.status(400).json({ error: 'Something went wrong' })

            }
        }
    } else {
        res.status(400).json({
            message: "User not found"
        })
    }

})

userRouter.get("/", (req, res) => {
    const user = req.body.email
   
    db.user.findUnique({ where: { email: user }, select: { id: true, name: true, email: true, phone: true } }).then((user) => {
        res.json(user)
    }).catch((e) => {
        res.status(400).json({
            message: "User not found"
        })
    })
})

userRouter.post("/", validate(UserSchema), async (req, res) => {

    try {
        const user = await db.user.create({ data: req.body, select: { id: true, name: true, email: true, phone: true } })
        if (user) {
            res.json({
                message: "User created successfully",
                user: user

            })

        } else {
            res.status(400).json({
                message: "Something went wrong"
            })
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {

            if (e.code === 'P2002') {
                res.status(400).json({ error: 'User with that email already exists' })
            } else {
                res.status(400).json({ error: 'Something went wrong' })
            }
        }

    }

})