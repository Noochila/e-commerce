import express from "express"

export const rootRouter=express.Router()

import {userRouter} from "./user"
import {productRouter} from "./product"
import {orderRouter} from "./order"


rootRouter.use("/users",userRouter)
rootRouter.use("/products",productRouter)
rootRouter.use("/orders",orderRouter)







