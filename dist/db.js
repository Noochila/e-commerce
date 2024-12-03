"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_2.Prisma; } });
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
