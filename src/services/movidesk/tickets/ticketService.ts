import { createTicketRequest } from "./ticketApi.js"
import type { CreateTicketInput, TicketResponse } from "../../../types/movidesk.js"

export async function createTicket({ clientId, assunto, descricao, threadContext }: CreateTicketInput): Promise<TicketResponse> {

    // payload también ayuda con las métricas: cuenta cantidad y asunto de cada ticket
    const ticketBody = {
        type: 2,
        subject: assunto,
        category: null,
        serviceFirstLevelId: null,
        serviceFirstLevel: null,
        serviceSecondLevel: null,
        serviceThirdLevel: null,
        urgency: "Média",
        status: "Novo",
        createdBy: {
            id: clientId,
        },
        clients: [
            {
                id: clientId,
            }
        ],
        actions: [
            {
                type: 2,
                origin: 9,
                description: descricao,
                createdBy: {
                    id: clientId,
                }
            },
            {
                type: 1,
                origin: 9,
                description: threadContext,
                createdBy: {
                    id: clientId,
                }
            }
        ]
    }

    return await createTicketRequest(ticketBody)
}