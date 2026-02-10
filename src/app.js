import figlet from "figlet"
import {config} from "./config/env.js"
import { ticketResolve} from "./events/reaction.js"
// import { App , ExpressReceiver, LogLevel } from "@slack/bolt";
import pkg from '@slack/bolt';
const { App , ExpressReceiver, LogLevel } = pkg;
import express from "express"

export const receiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  clientId: config.slack.clientID,
  clientSecret: config.slack.clientSecret,
});

 export const app = new App({
  receiver,  
  logLevel:LogLevel.INFO,
  token: config.slack.botToken
})

receiver.app.use(express.json());

receiver.app.post("/webhook/ticket-aguardando-cliente-24h", async (req, res) => {
  const payload = req.body;
  console.log("webhook de 24h recebido:", payload);
  res.status(200).send("Webhook de 24h recebido com sucesso!");
});

receiver.app.post("/webhook/ticket-resolvido", async (req, res) => {
  const payload = req.body;
  const subject = payload.Subject
  const status = payload.Status;


  if (subject.startsWith("Ticket via Slack")) {
    console.log("Processando ticket do Slack...");
    console.log(`Título: ${subject}`);
    console.log(`Status: ${status}`);
    console.log(payload)

ticketResolve(app,payload.Id)
    //... logica para enviar no slack
    return res.status(200).send("OK");
  } 
  console.log(`Ticket ignorado: ${subject}`);
  res.status(200).send("ignorado, não é tkt do slack...");
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