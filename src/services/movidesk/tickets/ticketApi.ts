import { config } from "../../../config/env.js"
import type { TicketResponse } from "../../../types/movidesk.js"
import type {MovideskCreateTicketPayload} from "../../../types/movidesk.js"

const TOKEN = config.movidesk.token
const URL_CREATE_TICKET = config.movidesk.urlCreateTicket

export async function createTicketRequest(ticketBody: MovideskCreateTicketPayload): Promise<TicketResponse> {
    const response = await fetch(`${URL_CREATE_TICKET}${TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketBody),
    })

    if (!response.ok) {
        const text = await response.text()
        console.error(`Movidesk API retornou ${response.status}: ${text}`)
        throw new Error("Não foi possível criar o ticket no momento.\n\nTente novamente mais tarde.")
    }

    return await response.json()
}