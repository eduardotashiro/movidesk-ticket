import { pool } from "../connection.js";

// verifica si la notificación del webhook ya fue enviada
export async function checkWebhookSent(ticket_id, column) {
    try {
        // `column` debe ser un nombre de columna fijo, no pase datos de entrada del usuario aquí
        const result = await pool.query(
            `select ${column} as sent
            from ticket_slack_metadata
            where ticket_id = $1`, [ticket_id]);
        return result.rows[0];
    } catch (error) {
        console.error(`erro ao checar ${column}: `, error.message);
        return null
    }
}

// marca el webhook como enviado
export async function markWebhookSent(ticket_id, column) {
    try {
        const result = await pool.query(
            `update ticket_slack_metadata
            set ${column} = true
            where ticket_id = $1`, [ticket_id]);
        return result.rows[0];
    } catch (error) {
        console.error(`erro ao marcar ${column} como enviado: `, error.message);
        return null
    }
}

// verifica si el webhook ya fue procesado antes (dedicado/urgente)
export async function checkWebhookProcessed(webhook_key) {
    try {
        const result = await pool.query(
            `select 1
            from webhook_duplication_check_only_support
            where webhook_key = $1`, [webhook_key]);
        return result.rowCount > 0;
    } catch (error) {
        console.error(`erro ao checar duplicação de ${webhook_key}: `, error.message);
        return false
    }
}

// registra que el webhook ya fue procesado (dedicado/urgente)
export async function markWebhookProcessed(webhook_key) {
    try {
        const result = await pool.query(
            `insert into webhook_duplication_check_only_support (webhook_key)
            values ($1)
            on conflict do nothing`, [webhook_key]);
        return result.rowCount > 0;
    } catch (error) {
        console.error(`erro ao registrar duplicação de ${webhook_key}: `, error.message);
        return false
    }
}
