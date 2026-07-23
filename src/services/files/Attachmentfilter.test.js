import { describe, it, expect } from "vitest"
import { processFiles } from "./attachmentFilter.js"

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

describe("processFiles", () => {
    it("separa arquivos permitidos e rejeitados corretamente", () => {
        const files = [
            { name: "foto.png", filetype: "png", size: 1000 },
            { name: "virus.exe", filetype: "exe", size: 1000 },
        ]

        const { allowedFiles, rejectedFiles } = processFiles(files)

        expect(allowedFiles).toHaveLength(1)
        expect(allowedFiles[0].name).toBe("foto.png")
        expect(rejectedFiles).toHaveLength(1)
        expect(rejectedFiles[0].name).toBe("virus.exe")
    })

    it("rejeita arquivo que passa do tamanho máximo", () => {
        const files = [{ name: "video.mp4", filetype: "mp4", size: MAX_FILE_SIZE_BYTES + 1 }]

        const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles(files)

        expect(allowedFiles).toHaveLength(0)
        expect(rejectedFiles).toHaveLength(1)
        expect(rejectedDetails).toContain("acima de 20 MB")
    })

    it("indica os dois motivos quando extensão e tamanho são inválidos", () => {
        const files = [{ name: "arquivo.rar", filetype: "rar", size: MAX_FILE_SIZE_BYTES + 1 }]

        const { rejectedDetails } = processFiles(files)

        expect(rejectedDetails).toContain("extensão não permitida")
        expect(rejectedDetails).toContain("acima de 20 MB")
    })

    it("retorna listas vazias quando não há arquivos", () => {
        const { allowedFiles, rejectedFiles, rejectedDetails } = processFiles([])

        expect(allowedFiles).toEqual([])
        expect(rejectedFiles).toEqual([])
        expect(rejectedDetails).toBe("")
    })
})