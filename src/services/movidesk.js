

//Função que chama a API do Movidesk

import fetch from "node-fetch"


export async function createTicket({ nome, email, assunto, descricao, servico }) {


    const ticketBody = {
        type: 2,
        subject: assunto,
        category: categoria.serviceSecondLevel,
        serviceFirstLevelId: servico?.serviceFirstLevelId,
        serviceFirstLevel: servico?.serviceFirstLevel,
        serviceSecondLevel: servico?.serviceSecondLevel,
        serviceThirdLevel: servico?.serviceThirdLevel,
        urgency: "Média",
        status: "Novo",
        createdBy: {
            id: 1857718041, //ID.AGENTE ?
        },
        clients: [
            {
                id: 1857718041 || email || nome //COD.REF.CRIADOR.TICKET
            }
        ],
        actions: [
            {
                type: 2,
                origin: 9,
                description: "<p>" + descricao + "</p>",
                createdBy: {
                    id: 1857718041 //COD.REF.CRIADOR.TICKET
                }
            },
            {
                type: 1,
                origin: 9,
                description: "<p>Ticket Criado Via Slack</p>",
                createdBy: {
                    id: 1857718041 //COD.REF.CRIADOR.TICKET
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
    } else {
        return await response.json()
    }
}  

