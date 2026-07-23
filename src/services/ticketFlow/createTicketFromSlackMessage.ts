import type { WebClient } from "@slack/web-api"
import { config } from "../../config/env.js"
import { syncMovideskPerson } from "../movidesk/people/personService.js"
import { createTicket } from "../movidesk/tickets/ticketService.js"
import { handleTicketAttachments } from "../files/attachmentService.js"
import { saveTicketMetadata } from "../../db/queries/ticketMetadata.js"
import { buildThreadContext } from "../slack/threadContext.js"
import type { SlackMessage, SlackFile } from "../../types/slack.js"
import type { TicketResponse } from "../../types/movidesk.js"

export interface CreateTicketFromSlackMessageInput {
    client: WebClient
    channel: string
    updateTs: string
    attachmentsThreadTs: string
    messageAuthorId: string
    email: string
    name: string
    originalMessage: SlackMessage
    text: string
    files: SlackFile[]
}

// flujo compartido entre reactionHandler y emailModal: crea el ticket, actualiza el mensaje, guarda metadatos y procesa adjuntos
// attachmentsThreadTs se pasa aparte porque cada flujo usa una referencia distinta
export async function createTicketFromSlackMessage({
    client, 
    channel, 
    updateTs, 
    attachmentsThreadTs, 
    messageAuthorId, 
    email, 
    name, 
    originalMessage,
    text, 
    files
}: CreateTicketFromSlackMessageInput): Promise<TicketResponse> {
    const movideskId = await syncMovideskPerson(email, name)

    const threadContext = buildThreadContext(channel, originalMessage)

    const ticket = await createTicket({
        clientId: movideskId,
        assunto: `Ticket via Slack: ${text.substring(0, 69)}`,
        descricao: text,
        servico: null,
        threadContext,
    })

    const linkMovidesk = `${config.movidesk.urlTicketLink}${ticket.protocol}`
    await client.chat.update({
        channel: channel,
        ts: updateTs,
        text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nSeu ticket foi criado na *Central de Ajuda Tuna*.  Acompanhe sua solicitação em: <${linkMovidesk}|${ticket.protocol}>.\n\n\`\`\`Se for seu primeiro acesso, acesse "Obter uma senha" na página de login.\`\`\`\nAgradecemos sua atenção.`,
    })

    saveTicketMetadata(ticket.id, updateTs, originalMessage.ts, channel, messageAuthorId, ticket.protocol, linkMovidesk)

    await handleTicketAttachments({
        files,
        ticketId: ticket.id,
        client,
        channel,
        threadTs: attachmentsThreadTs
    })

    return ticket
}