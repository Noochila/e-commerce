import express from "express"
import cors from "cors"
const app = express()
const port = 3000

import {rootRouter} from "./routes/index"

app.use(cors())
app.use(express.json())

app.use("/api/v1",rootRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})






