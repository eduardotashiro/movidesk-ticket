import { config } from "../../config/env.js"
import type { SlackFile } from "../../types/slack.js"

export async function uploadSlackFileToMovidesk(ticketId: number, file: SlackFile): Promise<void> {

    // descarga el archivo desde Slack
    const slackResponse = await fetch(file.url_private, {
        headers: {
            Authorization: `Bearer ${config.slack.botToken}`
        }
    })

    if (!slackResponse.ok) {
        throw new Error("Arquivo não suportado")
    }

    const formData = new FormData()
    formData.append("file", await slackResponse.blob(), file.name)

    // sube el archivo al Movidesk
    const movideskResponse = await fetch(
        `${config.movidesk.urlUploadFile}?token=${config.movidesk.token}&id=${ticketId}&actionId=1`,
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

    await movideskResponse.json()
}