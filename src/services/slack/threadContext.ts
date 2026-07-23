import { config } from "../../config/env.js"
import type { SlackMessage } from "../../types/slack.js"

// ensambla el enlace/HTML del thread de slack para adjuntarlo al ticket de Movidesk.
export function buildThreadContext(channel: string, originalMessage: SlackMessage): string {
    let threadLink: string

    if (originalMessage.thread_ts && originalMessage.thread_ts !== originalMessage.ts) {
        const messageTsFormatted = originalMessage.ts.replace(".", "")
        const threadTsFormatted = originalMessage.thread_ts.replace(".", "")

        threadLink = `${config.slack.linkThread}${channel}/p${messageTsFormatted}?thread_ts=${threadTsFormatted}&cid=${channel}`
    } else {
        threadLink = `${config.slack.linkThread}${channel}/p${originalMessage.ts.replace(".", "")}`
    }

    return `<a href="${threadLink}"target="_blank">Abrir Thread no Slack</a>`
}