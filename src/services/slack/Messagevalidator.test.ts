import { describe, it, expect } from "vitest"
import { isOnlyFiles, isOnlyEmojis } from "./messageValidator.js"
import type { SlackFile } from "../../types/slack.js"

function buildFakeFile(overrides: Partial<SlackFile> = {}): SlackFile {
    return {
        name: "foto.png",
        filetype: "png",
        size: 1000,
        url_private: "https://fake-slack-url.com/foto.png",
        ...overrides
    }
}

describe("isOnlyFiles", () => {
    it("retorna true quando não há texto e há arquivos", () => {
        expect(isOnlyFiles("", [buildFakeFile()])).toBe(true)
    })

    it("retorna true quando o texto é só espaços em branco e há arquivos", () => {
        expect(isOnlyFiles("   ", [buildFakeFile()])).toBe(true)
    })

    it("retorna false quando há texto e arquivos", () => {
        expect(isOnlyFiles("preciso de ajuda", [buildFakeFile()])).toBe(false)
    })

    it("retorna false quando não há arquivos, mesmo sem texto", () => {
        expect(isOnlyFiles("", [])).toBe(false)
    })

    it("retorna false quando há texto e não há arquivos", () => {
        expect(isOnlyFiles("preciso de ajuda", [])).toBe(false)
    })
})


describe("isOnlyEmojis", () => {
    it("retorna true para um único emoji", () => {
        expect(isOnlyEmojis(":sos:")).toBe(true)
    })

    it("retorna true para múltiplos emojis separados por espaço", () => {
        expect(isOnlyEmojis(":sos: :fire: :warning:")).toBe(true)
    })

    it("retorna false quando há texto junto com emoji", () => {
        expect(isOnlyEmojis("preciso de ajuda :sos:")).toBe(false)
    })

    it("retorna false para texto comum", () => {
        expect(isOnlyEmojis("preciso de ajuda com o sistema")).toBe(false)
    })

    it("retorna false para string vazia", () => {
        expect(isOnlyEmojis("")).toBe(false)
    })
})