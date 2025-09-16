import { buildTicketModal } from "../views/ticketModal.js"

export function registerTicketCommand(app) {
    app.command("/ticket", async ({ ack, body, client }) => {
        await ack()

        console.log("ACK enviado com sucesso")

        await client.views.open({
            trigger_id: body.trigger_id,
            view: buildTicketModal(),
            metadata:JSON.stringify({// ALTERADO metadado enviar p/threadm &canal
                channel_id: body.channel_id,// ALTERADO metadado enviar p/threadm &canal
                thread_ts: body.thread_ts || body.ts// ALTERADO metadado enviar p/threadm &canal
            })
        })
    })
}
