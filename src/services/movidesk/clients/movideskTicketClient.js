import { config } from "../../config/env.js"

const TOKEN = config.movidesk.token
const URL_CREATE_TICKET = config.movidesk.urlCreateTicket

export async function postTicket(ticketBody) {
    const response = await fetch(`${URL_CREATE_TICKET}${TOKEN}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketBody),
    })

    if (!response.ok) {
        const text = await response.text()
        console.error(`Movidesk API retornou ${response.status}: ${text}`)
        throw new Error("Não foi possível criar o ticket no momento.\n\nTente novamente mais tarde.")
    }

    return await response.json()
}