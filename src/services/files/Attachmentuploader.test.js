import { describe, it, expect, vi, beforeEach } from "vitest"

// Mocka o config para não depender de variáveis de ambiente reais.
vi.mock("../../config/env.js", () => ({
    config: {
        slack: { botToken: "xoxb-fake-token" },
        movidesk: {
            urlUploadFile: "https://api.movidesk.com/public/v1/ticketFileUpload/?token=",
            token: "fake-movidesk-token"
        }
    }
}))

const { uploadSlackFileToMovidesk } = await import("./attachmentUploader.js")

// Payload real de um arquivo do Slack (capturado em teste manual), só com os
// campos que a função realmente usa.
const fakeFile = {
    name: "captura_de_tela.png",
    filetype: "png",
    size: 122347,
    url_private: "https://files.slack.com/files-pri/T09E8URS0D6-F0A9AJU8QBF/captura_de_tela.png"
}

describe("uploadSlackFileToMovidesk", () => {
    beforeEach(() => {
        global.fetch = vi.fn()
    })

    it("baixa do Slack e sobe pro Movidesk com sucesso", async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                blob: async () => new Blob(["conteudo-fake"])
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 1, fileName: fakeFile.name })
            })

        const result = await uploadSlackFileToMovidesk(95040, fakeFile)

        expect(result).toEqual({ id: 1, fileName: fakeFile.name })
        expect(global.fetch).toHaveBeenCalledTimes(2)

        // primeira chamada: download do Slack, com o Bearer token certo
        const [slackUrl, slackOptions] = global.fetch.mock.calls[0]
        expect(slackUrl).toBe(fakeFile.url_private)
        expect(slackOptions.headers.Authorization).toBe("Bearer xoxb-fake-token")

        // segunda chamada: upload pro Movidesk, com o ticketId certo na URL
        const [movideskUrl] = global.fetch.mock.calls[1]
        expect(movideskUrl).toContain("id=95040")
    })

    it("lança erro quando o download do Slack falha", async () => {
        global.fetch.mockResolvedValueOnce({ ok: false })

        await expect(uploadSlackFileToMovidesk(95040, fakeFile)).rejects.toThrow(
            "Aquivo não suportado"
        )
    })

    it("lança erro quando o upload pro Movidesk falha", async () => {
        global.fetch
            .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(["x"]) })
            .mockResolvedValueOnce({ ok: false, text: async () => "erro interno" })

        await expect(uploadSlackFileToMovidesk(95040, fakeFile)).rejects.toThrow(
            "Não foi possível anexar o arquivo ao ticket."
        )
    })
})