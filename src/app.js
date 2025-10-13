import figlet from "figlet"
import pkg from "@slack/bolt"
const { App } = pkg

import dotenv from "dotenv"
dotenv.config()


 export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET    
})

// importa os handlers e passa o app

import { registerTicketReaction } from "./events/reaction.js"

registerTicketReaction(app)


figlet("TUNA - SUPORTE", function (e, data) {
  if (e) {
    console.log("não gerou ASCII :(")
    return
  }
  console.log(data)
})