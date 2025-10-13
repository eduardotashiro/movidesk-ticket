import { app } from "./app.js"



(async () => {
    await app.start(process.env.PORT || 3000)
    console.log(`Tickets batendo na porta ${process.env.PORT || 3000}!`)
})()

