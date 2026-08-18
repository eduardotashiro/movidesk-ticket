import type { App } from "@slack/bolt"
import { config } from "../config/env.js"
import { getTicketSlackInfo } from "../db/queries/ticketMetadata.js"
import { checkWebhookSent, markWebhookSent, checkWebhookProcessed, markWebhookProcessed } from "../db/queries/webhookStatus.js"
import type { DedicatedWebhookPayload, UrgentWebhookPayload, MovideskTicketFull } from "../types/movidesk.js"

// verifica si el webhook de resolución ya fue enviado
export async function ticketResolve(app: App, webhook_ticket_id: number): Promise<void> {
    const resultDB = await getTicketSlackInfo(webhook_ticket_id)
    const check = await checkWebhookSent(webhook_ticket_id, "webhook_resolve_sent")
    try {
        if (!resultDB) {
            console.log(`tkt não encontrado no db`)
            return
        }

        if (!check || check.sent) {
            console.log(`webhook de resolvido já foi enviado ou erro ao checar para esse tkt`)
            return
        }

        await app.client.chat.postMessage({
            channel: resultDB.slack_channel_id,
            thread_ts: resultDB.slack_thread_ts,
            text: `Olá <@${resultDB.user_id}>,\n\nSeu atendimento <${resultDB.threadcontext}|${resultDB.protocol}> foi concluído :check:\n\nPermanecemos à disposição.`
        })
        await markWebhookSent(webhook_ticket_id, "webhook_resolve_sent")

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.log(`erro ao enviar resolvido no slack:`, message)
    }
}

// marca la notificación de 24 horas como enviada
export async function ticket24hForClose(app: App, webhook_ticket_id: number): Promise<void> {
    const resultDB = await getTicketSlackInfo(webhook_ticket_id)
    const check = await checkWebhookSent(webhook_ticket_id, "webhook_24h_sent")
    try {
        if (!resultDB) {
            console.log(`tkt não encontrado no db`)
            return
        }

        if (!check || check.sent) {
            console.log(`webhook de 24h já foi enviado ou erro ao checar para esse tkt`)
            return
        }

        await app.client.chat.postMessage({
            channel: resultDB.slack_channel_id,
            thread_ts: resultDB.slack_thread_ts,
            text: `Olá, <@${resultDB.user_id}>.\n\nIdentificamos que ainda não houve retorno no atendimento <${resultDB.threadcontext} | ${resultDB.protocol}>.\n\nCaso não haja uma resposta nas próximas 24 horas, o atendimento será finalizado automaticamente\n\nAgradecemos a compreensão.`
        })

        await markWebhookSent(webhook_ticket_id, "webhook_24h_sent")

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.log(`erro ao enviar 24h no slack:`, message)
    }
}

// Notificación de llamada dedicada
export async function ticketDedicated(app: App, payload: DedicatedWebhookPayload): Promise<void> {
    const ticket_id = payload.Id
    const webhook_key = `dedicado-${ticket_id}`
    try {
        const isDuplicate = await checkWebhookProcessed(webhook_key)

        if (isDuplicate) {
            console.log(`Webhook de dedicado para o ticket ${ticket_id} já foi processado antes. Ignorando.`)
            return
        }

        const response = await fetch(`${config.movidesk.urlCreateTicket}${config.movidesk.token}&id=${ticket_id}`)

        if (!response.ok) {
            console.error(`erro API: ${response.status} - ${response.statusText}`)
            return
        }

        const responseText = await response.text()

        console.log("STATUS:", response.status)
        console.log("CONTENT-TYPE:", response.headers.get("content-type"))
        console.log("RESPONSE:", responseText)

        let fullTicket: MovideskTicketFull

        try {
            fullTicket = JSON.parse(responseText)
        } catch (parseError) {
            console.error(`erro ao parsear JSON: ${parseError}. | retorno: ${responseText}`)
            return
        }


        const protocol = fullTicket.protocol || ticket_id
        const urgency = payload.Urgency || "Não especificada"
        const movidesk_url = `${config.movidesk.urlTicketLink}${protocol}`

        await app.client.chat.postMessage({
            channel: config.slack.channel as string,
            text: `:alert: Novo Chamado *CLICK BUS*\n\n*Ticket*: <${movidesk_url}|${protocol}>\n*Urgência:* ${urgency}`
        })
        await markWebhookProcessed(webhook_key)
        console.log(`Notificación enviada al ticket. ${ticket_id}`)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("Error al enviar la notificación:", message)
    }
}



// Notificación de llamada urgente
export async function ticketUrgent(app: App, payload: UrgentWebhookPayload): Promise<void> {
    const ticket_id = payload.Id
    const webhook_key = `urgente-${ticket_id}`
    try {
        const isDuplicate = await checkWebhookProcessed(webhook_key)

        if (isDuplicate) {
            console.log(`Webhook de urgente para o ticket ${ticket_id} já foi processado antes. Ignorando.`)
            return
        }

        const response = await fetch(`${config.movidesk.urlCreateTicket}${config.movidesk.token}&id=${ticket_id}`)

        if (!response.ok) {
            console.error(`erro API: ${response.status} - ${response.statusText}`)
            return
        }

        const responseText = await response.text()

        console.log("STATUS:", response.status)
        console.log("CONTENT-TYPE:", response.headers.get("content-type"))
        console.log("RESPONSE:", responseText)

        let fullTicket: MovideskTicketFull

        try {
            fullTicket = JSON.parse(responseText)
        } catch (parseError) {
            console.error(`erro ao parsear JSON: ${parseError}. | retorno: ${responseText}`)
            return
        }

        const organization = fullTicket.clients?.[0]?.organization?.businessName || "Organização não encontrada"
        const protocol = fullTicket.protocol || ticket_id

        const movidesk_url = `${config.movidesk.urlTicketLink}${protocol}`

        await app.client.chat.postMessage({
            channel: config.slack.channel as string,
            text: `:ahhhhhhhhh: Novo Chamado *URGENTE*\n\n*Ticket*: <${movidesk_url}|${protocol}>\n*Organização*: ${organization}`
        })
        await markWebhookProcessed(webhook_key)
        console.log(`Notificación enviada al ticket. ${ticket_id}`)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("Error al enviar la notificación:", message)
    }
}