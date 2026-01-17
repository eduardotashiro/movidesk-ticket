import figlet from "figlet"
import pkg from "@slack/bolt"
const { App } = pkg
import {config} from "./config/env.js"


 export const app = new App({
    token: config.slack.botToken,
    signingSecret: config.slack.signingSecret
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