import { describe, it, expect } from "vitest"
import { isFileAllowed, isFileSizeAllowed } from "./fileValidator.js"

describe("isFileAllowed", () => {
    it("aceita extensões permitidas", () => {
        expect(isFileAllowed({ filetype: "pdf" })).toBe(true)
        expect(isFileAllowed({ filetype: "png" })).toBe(true)
        expect(isFileAllowed({ filetype: "mp4" })).toBe(true)
    })

    it("aceita extensão permitida mesmo em maiúsculas", () => {
        expect(isFileAllowed({ filetype: "PDF" })).toBe(true)
    })

    it("rejeita extensões não permitidas", () => {
        expect(isFileAllowed({ filetype: "rar" })).toBe(false)
        expect(isFileAllowed({ filetype: "exe" })).toBe(false)
    })
})

describe("isFileSizeAllowed", () => {
    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

    it("aceita arquivo exatamente no limite de 20MB", () => {
        expect(isFileSizeAllowed({ size: MAX_FILE_SIZE_BYTES })).toBe(true)
    })

    it("aceita arquivo menor que o limite", () => {
        expect(isFileSizeAllowed({ size: MAX_FILE_SIZE_BYTES - 1 })).toBe(true)
    })

    it("rejeita arquivo maior que o limite", () => {
        expect(isFileSizeAllowed({ size: MAX_FILE_SIZE_BYTES + 1 })).toBe(false)
    })
})