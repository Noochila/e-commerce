"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.userRouter = express_1.default.Router();
const db_1 = __importDefault(require("../db"));
const zod_1 = __importDefault(require("zod"));
const db_2 = require("../db");
const UserSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "Name is required" }).min(3, "Minimum 3 characters required"),
    email: zod_1.default.string({ required_error: "Email is requried" }).email("Invalid email"),
    password: zod_1.default.string({ required_error: "Password is required" }).min(6, "Password too short"),
    phone: zod_1.default.string({ required_error: "Phone no Required" }).min(10, "Invalid phone number required 10 digits")
});
const UserUpdateSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string({ required_error: "Email is requried" }).email("Invalid email"),
    password: zod_1.default.string().min(6, "Password too short").optional(),
    phone: zod_1.default.string().min(10, "Invalid phone number").optional()
});
const validate = (schema) => async (req, res, next) => {
    try {
        const user = schema.parse(req.body);
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
exports.userRouter.put("/", validate(UserUpdateSchema), async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required for updating" });
        return;
    }
    const user = await db_1.default.user.findUnique({ where: { email: req.body.email } });
    if (user) {
        try {
            const updatedUser = await db_1.default.user.update({ where: { email: req.body.email }, data: req.body, select: { id: true, name: true, email: true, phone: true } });
            res.json({
                message: "User updated successfully",
                user: updatedUser
            });
        }
        catch (e) {
            if (e instanceof db_2.Prisma.PrismaClientKnownRequestError) {
                res.status(400).json({ error: 'Something went wrong' });
            }
        }
    }
    else {
        res.status(400).json({
            message: "User not found"
        });
    }
});
exports.userRouter.get("/", (req, res) => {
    const user = req.body.email;
    if (!user || typeof user !== 'string' || (user.search('@') === -1 && user.search('.') === -1)) {
        res.status(400).json({
            message: "Invalid email"
        });
        return;
    }
    db_1.default.user.findUnique({
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
exports.userRouter.post("/", validate(UserSchema), async (req, res) => {
    try {
        const user = await db_1.default.user.create({ data: req.body, select: { id: true, name: true, email: true, phone: true } });
        if (user) {
            res.json({
                message: "User created successfully",
                user: user
            });
        }
        else {
            res.status(400).json({
                message: "Something went wrong"
            });
        }
    }
    catch (e) {
        if (e instanceof db_2.Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                res.status(400).json({ error: 'User with that email already exists' });
            }
            else {
                res.status(400).json({ error: 'Something went wrong' });
            }
        }
    }
});
exports.userRouter.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});
