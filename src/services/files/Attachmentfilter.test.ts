import { describe, it, expect } from "vitest"
import { processFiles } from "./attachmentFilter.js"
import { FileValidationReason } from "../../types/attachment.js"

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

describe("processFiles", () => {
    it("separa arquivos permitidos e rejeitados corretamente", () => {
        const files = [
    {
        name: "foto.png",
        filetype: "png",
        size: 1000,
        url_private: "https://teste.com/foto.png"
    },
    {
        name: "virus.exe",
        filetype: "exe",
        size: 1000,
        url_private: "https://teste.com/virus.exe"
    },
]

        const { allowedFiles, rejectedFiles } = processFiles(files)

        expect(allowedFiles).toHaveLength(1)
        expect(allowedFiles[0].name).toBe("foto.png")
        expect(rejectedFiles).toHaveLength(1)
        expect(rejectedFiles[0].name).toBe("virus.exe")
    })

    it("rejeita arquivo que passa do tamanho máximo", () => {
        const files = [{ name: "video.mp4", filetype: "mp4", size: MAX_FILE_SIZE_BYTES + 1, url_private: "https://teste.com/video.mp4" }]

        const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles(files)

        expect(allowedFiles).toHaveLength(0)
        expect(rejectedFiles).toHaveLength(1)
        expect(rejectedDetails).toContain(FileValidationReason.MAX_SIZE)
    })

    it("indica os dois motivos quando extensão e tamanho são inválidos", () => {
        const files = [{ name: "arquivo.rar", filetype: "rar", size: MAX_FILE_SIZE_BYTES + 1, url_private: "https://teste.com/arquivo.rar" }]

        const { rejectedDetails } = processFiles(files)

        expect(rejectedDetails).toContain(FileValidationReason.INVALID_EXTENSION)
        expect(rejectedDetails).toContain(FileValidationReason.MAX_SIZE)
    })

    it("retorna listas vazias quando não há arquivos", () => {
        const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles([])

        expect(allowedFiles).toEqual([])
        expect(rejectedFiles).toEqual([])
        expect(rejectedDetails).toBe("")
    })
})