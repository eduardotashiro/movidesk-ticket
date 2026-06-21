export async function parseMentions(text, client) {
    if (!text) return text;

    const mentionRegex = /<@([A-Z0-9]+)>/g;
    const matches = [...text.matchAll(mentionRegex)];

    for (const match of matches) {
        const userId = match[1];
        try {
            const userInfo = await client.users.info({ user: userId });
            if (userInfo.ok) {
                const realName = userInfo.user.profile.real_name;
                text = text.replace(match[0], realName);
            }
        } catch (error) {
            console.error(`Erro ao buscar nome do usuário ${userId}:`, error);
        }
    }

    return text;
}
