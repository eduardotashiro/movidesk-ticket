import pkg from "@slack/bolt"
const { App } = pkg

import dotenv from "dotenv"
dotenv.config()


 export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    botToken: process.env.SLACK_BOT_TOKEN
})

// importa os handlers e passa o app
import { registerTicketCommand } from "./commands/ticket.js"
import { registerTicketModal } from "./views/ticketModal.js"

registerTicketCommand(app)
registerTicketModal(app)

