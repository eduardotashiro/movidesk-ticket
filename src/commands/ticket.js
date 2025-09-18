import { buildTicketModal } from "../views/ticketModal.js"

export function registerTicketCommand(app) {
    app.command("/ticket", async ({ ack, body, client }) => {
        await ack()

        const channelId = body.channel_id;

        console.log("ACK enviado com sucesso")

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                ...buildTicketModal(), // vou sonhar com esses três pontos ... 
                private_metadata: body.channel_id
            }

        })
        console.log("debug canal:", body.channel_id);
    })
}
