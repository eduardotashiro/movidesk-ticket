import type { WebClient } from "@slack/web-api"

export async function parseMentions(text: string, client: WebClient): Promise<string> {
    if (!text) return text

    const mentionRegex = /<@([A-Z0-9]+)>/g
    const matches = [...text.matchAll(mentionRegex)]

    for (const match of matches) {
        const userId = match[1]
        try {
            const userInfo = await client.users.info({ user: userId })
            if (userInfo.ok && userInfo.user?.profile?.real_name) {
                text = text.replace(match[0], userInfo.user.profile.real_name)
            }
        } catch (error) {
            console.error(`Erro ao buscar nome do usuário ${userId}:`, error)
        }
    }

    return text
}