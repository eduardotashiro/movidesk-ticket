import { pool } from "../connection.js";

// guarda los metadatos del ticket
export async function saveTicketMetadata(ticket_id, slack_thread_ts, original_message_ts, slack_channel_id, user_id, protocol, threadContext) {
    try {
        await pool.query(
            `insert into ticket_slack_metadata (ticket_id, slack_thread_ts, original_message_ts, slack_channel_id, user_id, protocol, threadContext)		
             values($1,$2,$3,$4,$5,$6,$7)`, [ticket_id, slack_thread_ts, original_message_ts, slack_channel_id, user_id, protocol, threadContext]);
    } catch (error) {
        console.error(`erro ao salvar metadados do ticket:`, error.message);
        return []
    }
}


// devuelve los datos de Slack vinculados a un ticket
export async function getTicketSlackInfo(webhook_ticket_id) {
    try {
        const result = await pool.query(
            `select ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext
            from ticket_slack_metadata
            where ticket_id = $1`, [webhook_ticket_id]);
        return result.rows[0];
    } catch (error) {
        console.error(`erro ao buscar info do slack para o ticket ${webhook_ticket_id}:`, error.message);
        return []
    }
}

// verifica si ya existe un ticket para ese mensaje del slack
export async function checkTicketExists(slack_channel_id, original_message_ts) {
    try {
        const result = await pool.query(
            `select 1
            from ticket_slack_metadata
            where slack_channel_id = $1
            and original_message_ts = $2`, [slack_channel_id, original_message_ts]);
        return result.rowCount > 0;
    } catch (error) {
        console.error(`erro ao checar ticket existente para canal ${slack_channel_id} e thread ${original_message_ts}: `, error.message);
        return false
    }
}