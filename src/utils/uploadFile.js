import { config } from "../config/env.js";

export async function uploadSlackFileToMovidesk(ticketId, file) {
    
    // Baixa arquivo do Slack
    const slackResponse = await fetch(file.url_private, { 
        headers: 
        {
            Authorization: `Bearer ${config.slack.botToken}`
        }
    })

    if (!slackResponse.ok) 
    throw new Error("Aquivo não suportado");

    const formData = new FormData()
    formData.append("file", await slackResponse.blob(), file.name) 
    
    // Envia arquivo para Movidesk
    const movideskResponse = await fetch(
        `${config.movidesk.urlUploadFile}?token=${config.movidesk.token}&id=${ticketId}&actionId=1`, 
        {
            method: "POST",
            body: formData
        }
    )

    // Lida com erro de API
    if (!movideskResponse.ok) {
        const text = await movideskResponse.text()
        console.error(`Movidesk API retornou ${movideskResponse.status}: ${text}`)

        throw new Error("Não foi possível anexar o arquivo ao ticket.\n\nTente novamente mais tarde.")
    }

    return await movideskResponse.json() // Retorna info do arquivo enviado
}
