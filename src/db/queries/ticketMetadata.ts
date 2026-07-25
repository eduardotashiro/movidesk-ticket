import { pool } from "../connection.js"

export interface TicketSlackInfoRow {
    ticket_id: number
    slack_thread_ts: string
    slack_channel_id: string
    user_id: string
    protocol: string
    threadcontext: string
}

export async function saveTicketMetadata(
    ticket_id: number,
    slack_thread_ts: string,
    original_message_ts: string,
    slack_channel_id: string,
    user_id: string,
    protocol: string,
    threadContext: string
): Promise<void> {
    try {
        await pool.query(
            `insert into ticket_slack_metadata (ticket_id, slack_thread_ts, original_message_ts, slack_channel_id, user_id, protocol, threadContext)		
             values($1,$2,$3,$4,$5,$6,$7)`,
            [ticket_id, slack_thread_ts, original_message_ts, slack_channel_id, user_id, protocol, threadContext]
        )
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`erro ao salvar metadados do ticket:`, message)
    }
}

export async function getTicketSlackInfo(webhook_ticket_id: number): Promise<TicketSlackInfoRow | null> {
    try {
        const result = await pool.query<TicketSlackInfoRow>(
            `select ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext
            from ticket_slack_metadata
            where ticket_id = $1`,
            [webhook_ticket_id]
        )
        return result.rows[0] ?? null
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`erro ao buscar info do slack para o ticket ${webhook_ticket_id}:`, message)
        return null
    }
}

export async function checkTicketExists(slack_channel_id: string, original_message_ts: string): Promise<boolean> {
    try {
        const result = await pool.query(
            `select 1
            from ticket_slack_metadata
            where slack_channel_id = $1
            and original_message_ts = $2`,
            [slack_channel_id, original_message_ts]
        )
        return (result.rowCount ?? 0) > 0
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`erro ao checar ticket existente para canal ${slack_channel_id} e thread ${original_message_ts}: `, message)
        return false
    }
}