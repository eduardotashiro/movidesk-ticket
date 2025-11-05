import { pool } from "../db/db.js"


export async function ticketCounter() {
    
    try {
        const res = await pool.query(
        `UPDATE contagem_ticket_global
        SET total_tickets = total_tickets + 1
        WHERE id = 1;`,
        )
        return res.rows
    } catch (error) {
        console.error('Erro ao incrementar contador:', error)
        return [] //fallback
    }
}

