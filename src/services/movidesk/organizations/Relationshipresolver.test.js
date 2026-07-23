import { describe, it, expect, vi } from "vitest"

vi.mock("../../../config/env.js", () => ({
    config: {
        relationships: {
            angeloni: { id: "1", name: "Angeloni" },
            anotaAi: { id: "2", name: "Anota Aí", slaAgreement: "SLA-ANOTA" },
            tuna: { id: "3", name: "Tuna Payments", slaAgreement: "SLA-TUNA" },
            default: { id: "999", name: "Não é cliente", slaAgreement: "SLA-DEFAULT" }
        }
    }
}))

const { getRelationships } = await import("./relationshipResolver.js")

describe("getRelationships", () => {
    it("reconhece o domínio da Angeloni", () => {
        const [relationship] = getRelationships("fulano@angeloni.com.br")
        expect(relationship.id).toBe("1")
        expect(relationship.name).toBe("Angeloni")
    })

    it("reconhece o domínio da Anota Aí e inclui o SLA", () => {
        const [relationship] = getRelationships("fulano@anota.ai")
        expect(relationship.slaAgreement).toBe("SLA-ANOTA")
    })

    it("é case-insensitive no domínio do email", () => {
        const [relationship] = getRelationships("Fulano@ANGELONI.COM.BR")
        expect(relationship.name).toBe("Angeloni")
    })

    it("cai no default para domínio desconhecido", () => {
        const [relationship] = getRelationships("fulano@dominio-desconhecido.com")
        expect(relationship.id).toBe("999")
        expect(relationship.name).toBe("Não é cliente")
    })

    it("sempre retorna um array com um único relationship", () => {
        const result = getRelationships("fulano@tuna.uy")
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe("Tuna Payments")
    })
})