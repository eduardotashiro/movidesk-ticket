import { pool } from "../connection.js"

export interface TicketMetricsRow {
    total_tickets: number
}

// NOTA: mesmo aviso do ticketMetadata.ts sobre inconsistência sucesso/erro no retorno.

export async function incrementTicketCounter(): Promise<any> {
    try {
        const res = await pool.query(
            `UPDATE contagem_tickets_global
            SET total_tickets = total_tickets + 1
            WHERE id = 1;`
        )
        return res.rows
    } catch (error) {
        console.error("Erro ao incrementar contador:", error)
        return []
    }
}

export async function getTotalTicketsCount(): Promise<any> {
    try {
        const res = await pool.query<TicketMetricsRow>(
            `SELECT total_tickets
             FROM contagem_tickets_global
             WHERE id = 1;`
        )
        return res.rows[0]
    } catch (error) {
        console.error("Erro ao buscar métricas:", error)
        return []
    }
}