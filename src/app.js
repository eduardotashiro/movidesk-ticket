import figlet from "figlet"
import pkg from "@slack/bolt"
const { App } = pkg

import dotenv from "dotenv"
dotenv.config()


 export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET    
})



import { registerTicketReaction } from "./events/reaction.js"
import { homeTab } from "./homeTab/appHome.js"
registerTicketReaction(app)
homeTab(app)


figlet("TUNA   x   SUPORTE ", function (e, data) {
  if (e) {
    console.log("não gerou ASCII :(")
    return
  }
  console.log(data)
})