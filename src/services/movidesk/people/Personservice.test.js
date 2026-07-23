import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../organizations/relationshipResolver.js", () => ({
    getRelationships: vi.fn()
}))
vi.mock("./personApi.js", () => ({
    findMovideskPersonByEmail: vi.fn(),
    findMovideskPersonByUserName: vi.fn(),
    createMovideskPerson: vi.fn(),
    updateMovideskPerson: vi.fn()
}))

const { getRelationships } = await import("../organizations/relationshipResolver.js")
const {
    findMovideskPersonByEmail,
    findMovideskPersonByUserName,
    createMovideskPerson,
    updateMovideskPerson
} = await import("./personApi.js")
const { syncMovideskPerson } = await import("./personService.js")

const FAKE_RELATIONSHIP = [{ id: "999", name: "Não é cliente" }]

describe("syncMovideskPerson", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getRelationships.mockReturnValue(FAKE_RELATIONSHIP)
    })

    it("retorna o id direto quando a pessoa já existe, ativa e com organização", async () => {
        findMovideskPersonByEmail.mockResolvedValue([
            { id: 1, isActive: true, relationships: [{ id: "999" }] }
        ])

        const id = await syncMovideskPerson("user@teste.com", "Usuário Teste")

        expect(id).toBe(1)
        expect(updateMovideskPerson).not.toHaveBeenCalled()
        expect(createMovideskPerson).not.toHaveBeenCalled()
    })

    it("vincula organização quando a pessoa existe mas não tem relationships", async () => {
        findMovideskPersonByEmail.mockResolvedValue([
            { id: 2, isActive: true, relationships: [] }
        ])

        const id = await syncMovideskPerson("user@teste.com", "Usuário Teste")

        expect(id).toBe(2)
        expect(updateMovideskPerson).toHaveBeenCalledWith(2, { relationships: FAKE_RELATIONSHIP })
    })

    it("reativa a pessoa quando ela existe mas está inativa", async () => {
        findMovideskPersonByEmail.mockResolvedValue([
            { id: 3, isActive: false, relationships: [{ id: "999" }] }
        ])

        await syncMovideskPerson("user@teste.com", "Usuário Teste")

        expect(updateMovideskPerson).toHaveBeenCalledWith(3, { isActive: true })
    })

    it("corrige o email quando a pessoa só é encontrada pelo userName", async () => {
        findMovideskPersonByEmail.mockResolvedValue([])
        findMovideskPersonByUserName.mockResolvedValue([
            { id: 4, isActive: true, relationships: [{ id: "999" }] }
        ])

        const id = await syncMovideskPerson("user@teste.com", "Usuário Teste")

        expect(id).toBe(4)
        expect(updateMovideskPerson).toHaveBeenCalledWith(4, {
            emails: [{ emailType: "Pessoal", email: "user@teste.com", isDefault: true }]
        })
    })

    it("cria uma pessoa nova quando não encontra por email nem por userName", async () => {
        findMovideskPersonByEmail.mockResolvedValue([])
        findMovideskPersonByUserName.mockResolvedValue([])
        createMovideskPerson.mockResolvedValue({ id: 5 })

        const id = await syncMovideskPerson("novo@teste.com", "Pessoa Nova")

        expect(id).toBe(5)
        expect(createMovideskPerson).toHaveBeenCalledWith(
            expect.objectContaining({
                userName: "novo@teste.com",
                businessName: "Pessoa Nova",
                relationships: FAKE_RELATIONSHIP
            })
        )
    })
})