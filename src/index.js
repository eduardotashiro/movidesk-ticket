import { app } from "./app.js"

;(async () => {
    await app.start(process.env.PORT || 3000)
    console.log(`bot esta rodando na porta ${process.env.PORT || 3000}!!`)
})()
