import dotenv from "dotenv"
dotenv.config()


export async function createTicket({ clientId, assunto, descricao, servico, threadContext }) { //payload

     
    //const profileType = movideskPerson?.profileType ?? 3

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
           // profileType
        },
        clients: [
            {
                id: clientId,
               // profileType
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
                   // profileType
                }
            },
            {
                type: 1,
                origin: 9,
                description: threadContext,
                createdBy:
                {
                    id: clientId, //partner é o cliente do ticket, ajuda a liderança com as métricas e contabiliza quantidade e assunto de cada ticket
                   // profileType
                }
            }
        ]
    }


    const response = await fetch(`${process.env.URL_CREATE_TICKET}?token=${process.env.MOVIDESK_TOKEN}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketBody),
    })

    if (!response.ok) {
        const text = await response.text()
        console.error(`Movidesk API retornou ${response.status}: ${text}`)
        throw new Error(`"Não foi possível criar o ticket no momento.\n\nTente novamente mais tarde."`)
    }

    return await response.json()

}

