import { config } from "../config/env.js"


export async function createTicket({ clientId, assunto, descricao, threadContext }) { 

    //payload para enviar p/ movidesk
    const ticketBody = {
        type: 2,
        subject: assunto,
        category: null,
        serviceFirstLevelId:null,
        serviceFirstLevel:null,
        serviceSecondLevel:null,
        serviceThirdLevel:null,
        urgency: "Média",
        status: "Novo",
        createdBy:
        {
            id: clientId, //partner cria o ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
           
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
                createdBy:
                {
                    id: clientId, //partner é o cliente do ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket          
                }
            },
            {
                type: 1,
                origin: 9,
                description: threadContext,
                createdBy:
                {
                    id: clientId, //partner é o cliente do ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
                }
            }
        ]
    }

    // Chama API do Movidesk
    const response = await fetch(`${config.movidesk.urlCreateTicket}?token=${config.movidesk.token}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketBody),
    })

    // Lida com erro de API
    if (!response.ok) {
        const text = await response.text()
        console.error(`Movidesk API retornou ${response.status}: ${text}`)
        throw new Error(`"Não foi possível criar o ticket no momento.\n\nTente novamente mais tarde."`)
    }

    return await response.json()

}

