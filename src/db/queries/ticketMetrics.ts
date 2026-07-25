import { pool } from "../connection.js"

export interface TicketMetricsRow {
    total_tickets: number
}

export async function incrementTicketCounter(): Promise<void> {
    try {
        const res = await pool.query(
            `UPDATE contagem_tickets_global
            SET total_tickets = total_tickets + 1
            WHERE id = 1;`
        )
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("Erro ao incrementar contador:", message)
    }
}

export async function getTotalTicketsCount(): Promise<TicketMetricsRow | null> {
    try {
        const res = await pool.query<TicketMetricsRow>(
            `SELECT total_tickets
             FROM contagem_tickets_global
             WHERE id = 1;`
        )
        return res.rows[0] ?? null
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("Erro ao buscar métricas:", message)
        return null
    }
}