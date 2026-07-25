import type { WebClient } from "@slack/web-api"
import { processFiles } from "./attachmentFilter.js"
import { uploadSlackFileToMovidesk } from "./attachmentUploader.js"
import type { SlackFile } from "../../types/slack.js"

export interface HandleTicketAttachmentsInput {
    files: SlackFile[]
    ticketId: number
    client: WebClient
    channel: string
    threadTs: string
}

export async function handleTicketAttachments({ files, ticketId, client, channel, threadTs }: HandleTicketAttachmentsInput): Promise<void> {
    if (!files || files.length === 0) return

    const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles(files)

    if (rejectedFiles.length > 0) {
        await client.chat.postMessage({
            channel,
            thread_ts: threadTs,
            text: `:warning: Não foi possível anexar os seguintes arquivos:\n\`\`\`${rejectedDetails}\`\`\``
        })
    }

    if (allowedFiles.length > 0) {
        await Promise.all(allowedFiles.map((file) => uploadSlackFileToMovidesk(ticketId, file)))
    }
}