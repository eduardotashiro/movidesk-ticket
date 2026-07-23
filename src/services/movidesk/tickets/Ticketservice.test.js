import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("./ticketApi.js", () => ({
    createTicketRequest: vi.fn()
}))

const { createTicketRequest } = await import("./ticketApi.js")
const { createTicket } = await import("./ticketService.js")

describe("createTicket", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("monta o payload correto e retorna o resultado da API", async () => {
        createTicketRequest.mockResolvedValue({ id: 95040, protocol: "202607210009581" })

        const result = await createTicket({
            clientId: 123,
            assunto: "Ticket via Slack: teste",
            descricao: "descricao do problema",
            threadContext: "<a href='...'>Abrir Thread</a>"
        })

        expect(result).toEqual({ id: 95040, protocol: "202607210009581" })
        expect(createTicketRequest).toHaveBeenCalledTimes(1)

        const [payload] = createTicketRequest.mock.calls[0]
        expect(payload.type).toBe(2)
        expect(payload.subject).toBe("Ticket via Slack: teste")
        expect(payload.status).toBe("Novo")
        expect(payload.urgency).toBe("Média")
        expect(payload.clients).toEqual([{ id: 123 }])
    })

    it("monta duas actions: a descrição do ticket e o contexto da thread", () => {
        createTicketRequest.mockResolvedValue({ id: 1, protocol: "P1" })

        return createTicket({
            clientId: 456,
            assunto: "assunto",
            descricao: "descricao do problema",
            threadContext: "link-da-thread"
        }).then(() => {
            const [payload] = createTicketRequest.mock.calls[0]

            expect(payload.actions).toHaveLength(2)
            expect(payload.actions[0].description).toBe("descricao do problema")
            expect(payload.actions[0].type).toBe(2)
            expect(payload.actions[1].description).toBe("link-da-thread")
            expect(payload.actions[1].type).toBe(1)
        })
    })
})