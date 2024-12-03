"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.rootRouter = express_1.default.Router();
const user_1 = require("./user");
const product_1 = require("./product");
const order_1 = require("./order");
exports.rootRouter.use("/users", user_1.userRouter);
exports.rootRouter.use("/products", product_1.productRouter);
exports.rootRouter.use("/orders", order_1.orderRouter);
