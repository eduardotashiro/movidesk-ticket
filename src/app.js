import figlet from "figlet"
import { config } from "./config/env.js"
import { ticketResolve } from "./events/reaction.js"
import { ticket24hForClose } from "./events/reaction.js";
import pkg from '@slack/bolt';
const { App, ExpressReceiver, LogLevel } = pkg;
import express from "express"

export const receiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  clientId: config.slack.clientID,
  clientSecret: config.slack.clientSecret,
});

export const app = new App({
  receiver,
  logLevel: LogLevel.INFO,
  token: config.slack.botToken
})

receiver.app.use(express.json());

receiver.app.post("/webhook/ticket-aguardando-cliente-24h", async (req, res) => {
  const payload = req.body;
  console.log("webhook de 24h recebido:", payload);
  await ticket24hForClose(app, payload.Id)
  return res.status(200).send("Webhook de 24h recebido com sucesso!");
});

receiver.app.post("/webhook/ticket-resolvido", async (req, res) => {
  const payload = req.body;
  console.log(payload)
    console.log("webhook de resolvido recebido ido:", payload);
  await ticketResolve(app, payload.Id)
  return res.status(200).send("Webhook de resolvido recebido com sucesso po");
});



// Ticket ignorado: sdasdad
// Processando ticket do Slack...
// Título: Ticket via Slack: bla bla bla
// Status: Resolvido



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