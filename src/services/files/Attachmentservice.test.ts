import { describe, it, expect, vi, beforeEach } from "vitest"
import type { SlackFile } from "../../types/slack.js"

// Simula los dos módulos gestionados por handleTicketAttachments, para realizar pruebas.
// Solo la lógica de decisión (notificar + cargar), sin depender de su implementación real.
vi.mock("./attachmentFilter.js", () => ({
    processFiles: vi.fn()
}))

vi.mock("./attachmentUploader.js", () => ({
    uploadSlackFileToMovidesk: vi.fn()
}))

const { processFiles } = await import("./attachmentFilter.js")
const { uploadSlackFileToMovidesk } = await import("./attachmentUploader.js")
const { handleTicketAttachments } = await import("./attachmentService.js")

function buildFakeClient() {
    return {
        chat: {
            postMessage: vi.fn()
        }
    } as any
}

function buildFakeFile(overrides: Partial<SlackFile> = {}): SlackFile {
    return {
        name: "arquivo.png",
        filetype: "png",
        size: 1000,
        url_private: "https://teste.com/arquivo.png",
        ...overrides
    }
}

describe("handleTicketAttachments", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("não faz nada quando não há arquivos", async () => {
        const client = buildFakeClient()

        await handleTicketAttachments({
            files: [],
            ticketId: 1,
            client,
            channel: "C1",
            threadTs: "123.456"
        })

        expect(processFiles).not.toHaveBeenCalled()
        expect(client.chat.postMessage).not.toHaveBeenCalled()
        expect(uploadSlackFileToMovidesk).not.toHaveBeenCalled()
    })


    it("avisa no Slack e faz upload só dos arquivos permitidos", async () => {
        const client = buildFakeClient()

        const allowed = [
            buildFakeFile({ name: "foto.png" })
        ]

        const rejected = [
            buildFakeFile({
                name: "virus.exe",
                filetype: "exe"
            })
        ]

        vi.mocked(processFiles).mockReturnValue({
            allowedFiles: allowed,
            rejectedFiles: rejected,
            rejectedDetails: "• virus.exe (extensão não permitida)"
        })

        await handleTicketAttachments({
            files: [...allowed, ...rejected],
            ticketId: 95040,
            client,
            channel: "C1",
            threadTs: "123.456"
        })

        expect(client.chat.postMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: "C1",
                thread_ts: "123.456",
                text: expect.stringContaining("virus.exe")
            })
        )

        expect(uploadSlackFileToMovidesk).toHaveBeenCalledTimes(1)

        expect(uploadSlackFileToMovidesk).toHaveBeenCalledWith(
            95040,
            allowed[0]
        )
    })


    it("não avisa no Slack quando todos os arquivos são permitidos", async () => {
        const client = buildFakeClient()

        const allowed = [
            buildFakeFile({ name: "foto.png" }),
            buildFakeFile({
                name: "doc.pdf",
                filetype: "pdf"
            })
        ]

        vi.mocked(processFiles).mockReturnValue({
            allowedFiles: allowed,
            rejectedFiles: [],
            rejectedDetails: ""
        })

        await handleTicketAttachments({
            files: allowed,
            ticketId: 1,
            client,
            channel: "C1",
            threadTs: "t"
        })

        expect(client.chat.postMessage).not.toHaveBeenCalled()
        expect(uploadSlackFileToMovidesk).toHaveBeenCalledTimes(2)
    })


    it("não faz upload quando todos os arquivos são rejeitados", async () => {
        const client = buildFakeClient()

        const rejected = [
            buildFakeFile({
                name: "virus.exe",
                filetype: "exe"
            })
        ]

        vi.mocked(processFiles).mockReturnValue({
            allowedFiles: [],
            rejectedFiles: rejected,
            rejectedDetails: "• virus.exe (extensão não permitida)"
        })

        await handleTicketAttachments({
            files: rejected,
            ticketId: 1,
            client,
            channel: "C1",
            threadTs: "t"
        })

        expect(client.chat.postMessage).toHaveBeenCalledOnce()
        expect(uploadSlackFileToMovidesk).not.toHaveBeenCalled()
    })
})