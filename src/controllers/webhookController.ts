import type { Request, Response } from "express"
import type { App } from "@slack/bolt"
import { ticketDedicated, ticketResolve, ticketUrgent, ticket24hForClose } from "../notifications/ticketNotifications.js"

export async function handle24hWebhook(app: App, req: Request, res: Response): Promise<Response> {
    const payload = req.body
    console.log("webhook de 24h recebido:", payload)
    await ticket24hForClose(app, payload.Id)
    return res.status(200).send("Webhook de 24h recebido com sucesso!")
}

export async function handleResolvedWebhook(app: App, req: Request, res: Response): Promise<Response> {
    const payload = req.body
    console.log("webhook de resolvido recebido:", payload)
    await ticketResolve(app, payload.Id)
    return res.status(200).send("Webhook de resolvido recebido com sucesso!")
}

export async function handleDedicatedWebhook(app: App, req: Request, res: Response): Promise<Response> {
    const payload = req.body
    console.log("Webhook de dedicado recebido:", payload)
    await ticketDedicated(app, payload)
    return res.status(200).send("OK")
}

export async function handleUrgentWebhook(app: App, req: Request, res: Response): Promise<Response> {
    const payload = req.body
    console.log("Webhook de urgente recebido:", payload)
    await ticketUrgent(app, payload)
    return res.status(200).send("OK")
}