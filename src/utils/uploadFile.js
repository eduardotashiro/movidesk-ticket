export async function uploadSlackFileToMovidesk(ticketId, file) {
    
    const slackResponse = await fetch(file.url_private, { // Baixa o arquivo do Slack
        headers: 
        {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
        }
    })

    if (!slackResponse.ok) 
    throw new Error("Aquivo não suportado");

    const formData = new FormData()

    formData.append("file", await slackResponse.blob(), file.name) // Usa slackResponse.body direto como Blob/stream
  
    const movideskResponse = await fetch(
        `${process.env.URL_CREATE_FILE}?token=${process.env.MOVIDESK_TOKEN}&id=${ticketId}&actionId=1`, // Envia para o Movidesk
        {
            method: "POST",
            body: formData
        }
    )

    if (!movideskResponse.ok) {
        const text = await movideskResponse.text()
        console.error(`Movidesk API retornou ${movideskResponse.status}: ${text}`)

        throw new Error("Não foi possível anexar o arquivo ao ticket.\n\nTente novamente mais tarde.")
    }

    return await movideskResponse.json()
}
