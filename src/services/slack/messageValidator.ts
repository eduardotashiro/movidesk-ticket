import type { SlackFile } from "../../types/slack.js"

// comprueba si el mensaje contiene solo archivos (sin txt)
export const isOnlyFiles = (text: string, files: SlackFile[]): boolean => {
    return (!text || !text.trim()) && files.length > 0
}

// comprueba si el mensaje contiene solo emojis (sin txt)
export const isOnlyEmojis = (text: string): boolean => {
    return /^(:[a-z0-9_+-]+:\s*)+$/gi.test(text.trim())
}