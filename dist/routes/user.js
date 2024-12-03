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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.userRouter = express_1.default.Router();
const db_1 = __importDefault(require("../db"));
const zod_1 = __importDefault(require("zod"));
const db_2 = require("../db");
const UserSchema = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().email("Invalid email"),
    password: zod_1.default.string().min(6, "Password too short"),
    phone: zod_1.default.string().min(10, "Invalid phone number")
});
const UserUpdateSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().email("Invalid email"),
    password: zod_1.default.string().min(6, "Password too short").optional(),
    phone: zod_1.default.string().min(10, "Invalid phone number").optional()
});
const validate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.userRouter.put("/", validate(UserUpdateSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { email: req.body.email } });
    if (user) {
        try {
            const updatedUser = yield db_1.default.user.update({ where: { email: req.body.email }, data: req.body, select: { id: true, name: true, email: true, phone: true } });
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
}));
exports.userRouter.get("/", (req, res) => {
    const user = req.body.email;
    db_1.default.user.findUnique({ where: { email: user }, select: { id: true, name: true, email: true, phone: true } }).then((user) => {
        res.json(user);
    }).catch((e) => {
        res.status(400).json({
            message: "User not found"
        });
    });
});
exports.userRouter.post("/", validate(UserSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.user.create({ data: req.body, select: { id: true, name: true, email: true, phone: true } });
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
}));
