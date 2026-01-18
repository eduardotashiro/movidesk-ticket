import { config } from "./config/env.js" 
import { app } from "./app.js"

(async () => {
    await app.start(config.port || 3000)
    console.log(`Tickets batendo na porta ${config.port || 3000}!`)
})()

