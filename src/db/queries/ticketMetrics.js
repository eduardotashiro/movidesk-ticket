import { pool } from "../connection.js";

// incrementa el contador global de tickets en 1
export async function incrementTicketCounter() {
    try {
        const res = await pool.query(
            `UPDATE contagem_tickets_global
            SET total_tickets = total_tickets + 1
            WHERE id = 1;`);
        return res.rows;
    } catch (error) {
        console.error('Erro ao incrementar contador:', error);
        return []
    }
}


// Devuelve el total de tickets contados hasta ahora
export async function getTotalTicketsCount() {
    try {
        const res = await pool.query(
            `SELECT total_tickets
             FROM contagem_tickets_global
             WHERE id = 1;`);
        return res.rows[0];
    } catch (error) {
        console.error("Erro ao buscar métricas:", error);
        return []
    }
}