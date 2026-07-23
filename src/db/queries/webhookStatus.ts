import { pool } from "../connection.js"

// União fechada das colunas válidas — o comentário original já avisava
// "deve ser um nome de coluna fixo, não passe dado de usuário aqui";
// tipar como union literal garante isso em tempo de compilação.
export type WebhookSentColumn = "webhook_resolve_sent" | "webhook_24h_sent"

export interface WebhookSentRow {
    sent: boolean
}

export async function checkWebhookSent(ticket_id: number, column: WebhookSentColumn): Promise<any> {
    try {
        const result = await pool.query<WebhookSentRow>(
            `select ${column} as sent
            from ticket_slack_metadata
            where ticket_id = $1`,
            [ticket_id]
        )
        return result.rows[0]
    } catch (error: any) {
        console.error(`erro ao checar ${column}: `, error.message)
        return null
    }
}

export async function markWebhookSent(ticket_id: number, column: WebhookSentColumn): Promise<any> {
    try {
        const result = await pool.query(
            `update ticket_slack_metadata
            set ${column} = true
            where ticket_id = $1`,
            [ticket_id]
        )
        return result.rows[0]
    } catch (error: any) {
        console.error(`erro ao marcar ${column} como enviado: `, error.message)
        return null
    }
}

export async function checkWebhookProcessed(webhook_key: string): Promise<boolean> {
    try {
        const result = await pool.query(
            `select 1
            from webhook_duplication_check_only_support
            where webhook_key = $1`,
            [webhook_key]
        )
        return (result.rowCount ?? 0) > 0
    } catch (error: any) {
        console.error(`erro ao checar duplicação de ${webhook_key}: `, error.message)
        return false
    }
}

export async function markWebhookProcessed(webhook_key: string): Promise<boolean> {
    try {
        const result = await pool.query(
            `insert into webhook_duplication_check_only_support (webhook_key)
            values ($1)
            on conflict do nothing`,
            [webhook_key]
        )
        return (result.rowCount ?? 0) > 0
    } catch (error: any) {
        console.error(`erro ao registrar duplicação de ${webhook_key}: `, error.message)
        return false
    }
}