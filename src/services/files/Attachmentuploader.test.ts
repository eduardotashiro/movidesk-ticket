import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"

vi.mock("../../config/env.js", () => ({
    config: {
        slack: {
            botToken: "xoxb-fake-token"
        },
        movidesk: {
            urlUploadFile: "https://api.movidesk.com/public/v1/ticketFileUpload/",
            token: "fake-movidesk-token"
        }
    }
}))

const { uploadSlackFileToMovidesk } = await import("./attachmentUploader.js")

const fakeFile = {
    name: "captura_de_tela.png",
    filetype: "png",
    size: 122347,
    url_private: "https://files.slack.com/files-pri/fake-file.png"
}

describe("uploadSlackFileToMovidesk", () => {
    let fetchMock: Mock

    beforeEach(() => {
        vi.clearAllMocks()

        fetchMock = vi.fn()
        global.fetch = fetchMock as typeof global.fetch
    })

    it("baixa o arquivo do Slack e envia para o Movidesk com sucesso", async () => {
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                blob: async () => new Blob(["conteudo-fake"])
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 1,
                    fileName: fakeFile.name
                })
            })

        await expect(
            uploadSlackFileToMovidesk(95040, fakeFile)
        ).resolves.toBeUndefined()

        expect(fetchMock).toHaveBeenCalledTimes(2)

        const [slackUrl, slackOptions] = fetchMock.mock.calls[0]

        expect(slackUrl).toBe(fakeFile.url_private)
        expect(slackOptions.headers.Authorization).toBe("Bearer xoxb-fake-token")

        const [movideskUrl, movideskOptions] = fetchMock.mock.calls[1]

        expect(movideskUrl).toContain("id=95040")
        expect(movideskOptions.method).toBe("POST")
    })

    it("lança erro quando o download do Slack falha", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false
        })

        await expect(
            uploadSlackFileToMovidesk(95040, fakeFile)
        ).rejects.toThrow("Arquivo não suportado")
    })

    it("lança erro quando o upload no Movidesk falha", async () => {
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                blob: async () => new Blob(["arquivo"])
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => "erro interno"
            })

        await expect(
            uploadSlackFileToMovidesk(95040, fakeFile)
        ).rejects.toThrow(
            "Não foi possível anexar o arquivo ao ticket."
        )
    })
})