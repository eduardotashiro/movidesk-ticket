import { pool } from "../db/db.js"

//contador
export async function ticketCounter() {

    try {
        const res = await pool.query(
            `UPDATE contagem_tickets_global
        SET total_tickets = total_tickets + 1
        WHERE id = 1;`)
        return res.rows
    } catch (error) {
        console.error('Erro ao incrementar contador:', error)
        return [] //fallback
    }
}

//mostrador kk
export async function showMetrics() {
    try {
        const res = await pool.query(`
      SELECT total_tickets
      FROM contagem_tickets_global
      WHERE id = 1;`)
        return res.rows[0]
    } catch (error) {
        console.error("Erro ao buscar métricas:", error)
        return []
    }
}

// pega metadados do ticket
export async function catchMetadata(ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext) {
    try {
        await pool.query(
            `insert into ticket_slack_metadata (ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext)		
             values($1,$2,$3,$4,$5,$6)`,
            [ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext]
        )
    } catch (error) {
        console.log(`erro ao pegar metadados do tkt:`, error.message)
        return []
    }
}


//manda msg de resolvido no slack
export async function catchInfo(webhook_ticket_id) {
    try {
        const result = await pool.query(
            `select ticket_id, slack_thread_ts, slack_channel_id, user_id, protocol, threadContext
            from ticket_slack_metadata
            where ticket_id = $1`, [webhook_ticket_id]
        );
        return result.rows[0];
    } catch (error) {
        console.log(`erro ao enviar mensagem de resolvido no slack:`, error.message);
        return []
    }
}


// verifica si la notificación del webhook ya fue enviada
export async function checkWebhookSent(ticket_id, column) {
    try {
        const result = await pool.query(
            `select ${column} as sent
            from ticket_slack_metadata
            where ticket_id = $1`, [ticket_id]
        );
        return result.rows[0];
    }  catch (error) {
        console.log(`erro ao checar ${column}: `, error.message);
        return null
    }
}

// marca el webhook como enviado
export async function markWebhookSent(ticket_id, column) {
    try {
        const result = await pool.query(
            `update ticket_slack_metadata
            set ${column} = true
            where ticket_id = $1`, [ticket_id]
        );
        return result.rows[0];
    } catch (error) {
        console.log(`erro ao marcar ${column} como enviado: `, error.message);
        return null
    }
}