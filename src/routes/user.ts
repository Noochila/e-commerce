import express, { NextFunction } from "express"
export const userRouter = express.Router()
import db from "../db"
import zod, { any, ZodAny } from "zod"
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

    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required for updating" });
        return;
    }

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
    const user = req.body.email;

    if (!user || typeof user !== 'string' || (user.search('@') === -1 && user.search('.') === -1)) {
        res.status(400).json({
            message: "Invalid email"
        })
        return;

    }

    db.user.findUnique({
        where: { email: user },
        select: { id: true, name: true, email: true, phone: true }
    })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.json(user);
        })
        .catch((e) => {
            console.error(e); // Log the error for debugging
            res.status(500).json({
                message: "An error occurred while fetching the user"
            });
        });
});

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

userRouter.use((err:Error, req:express.Request, res:express.Response, next:NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});
