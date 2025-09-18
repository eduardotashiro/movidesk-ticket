import fetch from "node-fetch"

import dotenv from "dotenv"
dotenv.config()


export async function createTicket({ clientId, assunto, descricao, servico }) {


    const ticketBody = {
        type: 2,
        subject: assunto,
        category: null,
        serviceFirstLevelId: servico?.serviceFirstLevelId,
        serviceFirstLevel: servico?.serviceFirstLevel,
        serviceSecondLevel: servico?.serviceSecondLevel,
        serviceThirdLevel: servico?.serviceThirdLevel,
        urgency: "Média",
        status: "Novo",
        createdBy: {
            id: clientId, //partner cria o ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
        },
        clients: [
            {
                id: clientId 
            }
        ],
        actions: [
            {
                type: 2,
                origin: 9,
                description: "<p>" + descricao + "</p>",
                createdBy: {
                    id: clientId //partner é o cliente do ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
                }
            },
            {
                type: 1,
                origin: 9,
                description: "<p>Ticket Criado Via Slack</p>",
                createdBy: {
                    id: clientId //partner é o cliente do ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
                }
            }
        ]
    }


    const response = await fetch(`https://api.movidesk.com/public/v1/tickets?token=${process.env.MOVIDESK_TOKEN}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketBody),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Movidesk API retornou ${response.status}: ${text}`)
    }

    return await response.json()

}

