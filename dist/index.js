"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
const index_1 = require("./routes/index");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1", index_1.rootRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
