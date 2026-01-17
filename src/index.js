import dotenv from "dotenv"
dotenv.config()

import { app } from "./app.js"
import { config } from "./config/env.js"

(async () => {
    await app.start(config.port || 3000)
    console.log(`Tickets batendo na porta ${config.port || 3000}!`)
})()

