import { readFileSync } from 'fs'

export function readIdSlack(filepath) {
    const data = readFileSync(filepath, 'utf-8')
    return JSON.parse(data)
}

export function getMovideskId(users, slackId) {
    const user = users.find(u => u.id_slack === slackId)
    return user ? user.id_movidesk : null //operador ternário
}