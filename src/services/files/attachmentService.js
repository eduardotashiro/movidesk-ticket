import { processFiles } from "../../utils/files/fileProcessor.js";
import { uploadSlackFileToMovidesk } from "./movideskFileClient.js";

export async function handleTicketAttachments({ files, ticketId, client, channel, threadTs }) {
    if (!files || files.length === 0) return;

    const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles(files);

    if (rejectedFiles.length > 0) {
        await client.chat.postMessage({
            channel: channel,
            thread_ts: threadTs,
            text: `:warning: Os seguintes arquivos não puderam ser anexados:\n\`\`\`${rejectedDetails}\`\`\``
        });
    }

    if (allowedFiles.length > 0) {
        await Promise.all(allowedFiles.map((file) => uploadSlackFileToMovidesk(ticketId, file)));
    }
}