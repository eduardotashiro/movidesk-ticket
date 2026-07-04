import figlet from "figlet"
import pkg from '@slack/bolt';
import express from "express"
import { config } from "./config/env.js"
import { registerTicketReaction } from "./events/reaction.js"
import { homeTab } from "./homeTab/appHome.js"
import { webhookRoutes } from "./routes/webhookRoutes.js"
import { printBanner } from "./utils/banner.js"

const { App, ExpressReceiver, LogLevel } = pkg;

export const receiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  // clientId e clientSecret OAuth flow (multi-workspace)
  // clientId: config.slack.clientID,
  // clientSecret: config.slack.clientSecret,
});

export const app = new App({
  receiver,
  logLevel: LogLevel.INFO,
  token: config.slack.botToken
})

receiver.app.use(express.json());

webhookRoutes(receiver, app)
registerTicketReaction(app)
homeTab(app)

printBanner("TUNA   x   SUPORTE ")