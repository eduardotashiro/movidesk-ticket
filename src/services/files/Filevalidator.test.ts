import { describe, it, expect } from "vitest"
import { isFileAllowed, isFileSizeAllowed } from "./fileValidator.js"
import type { SlackFile } from "../../types/slack.js"

function buildFakeFile(overrides: Partial<SlackFile> = {}): SlackFile {
    return {
        name: "arquivo-teste.png",
        filetype: "png",
        size: 1000,
        url_private: "https://fake-slack-url.com/file.png",
        ...overrides
    }
}

describe("isFileAllowed", () => {
    it("aceita extensões permitidas", () => {
        expect(isFileAllowed(buildFakeFile({ filetype: "pdf" }))).toBe(true)
        expect(isFileAllowed(buildFakeFile({ filetype: "png" }))).toBe(true)
        expect(isFileAllowed(buildFakeFile({ filetype: "mp4" }))).toBe(true)
    })

    it("aceita extensão permitida mesmo em maiúsculas", () => {
        expect(isFileAllowed(buildFakeFile({ filetype: "PDF" }))).toBe(true)
    })

    it("rejeita extensões não permitidas", () => {
        expect(isFileAllowed(buildFakeFile({ filetype: "rar" }))).toBe(false)
        expect(isFileAllowed(buildFakeFile({ filetype: "exe" }))).toBe(false)
    })
})


describe("isFileSizeAllowed", () => {
    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

    it("aceita arquivo exatamente no limite de 20MB", () => {
        expect(
            isFileSizeAllowed(buildFakeFile({ size: MAX_FILE_SIZE_BYTES }))
        ).toBe(true)
    })

    it("aceita arquivo menor que o limite", () => {
        expect(
            isFileSizeAllowed(buildFakeFile({ size: MAX_FILE_SIZE_BYTES - 1 }))
        ).toBe(true)
    })

    it("rejeita arquivo maior que o limite", () => {
        expect(
            isFileSizeAllowed(buildFakeFile({ size: MAX_FILE_SIZE_BYTES + 1 }))
        ).toBe(false)
    })
})