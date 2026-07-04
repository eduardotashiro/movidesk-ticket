import { handle24hWebhook, handleResolvedWebhook, handleDedicatedWebhook, handleUrgentWebhook } from "../controllers/webhookController.js";

export function webhookRoutes(receiver, app) {
    receiver.app.post("/webhook/ticket-aguardando-cliente-24h", (req, res) => handle24hWebhook(app, req, res))
    receiver.app.post("/webhook/ticket-resolvido", (req, res) => handleResolvedWebhook(app, req, res))
    receiver.app.post("/webhook/dedicado-notificado", (req, res) => handleDedicatedWebhook(app, req, res))
    receiver.app.post("/webhook/urgente-notificado", (req, res) => handleUrgentWebhook(app, req, res))
}