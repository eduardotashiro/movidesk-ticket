import { describe, it, expect, vi } from "vitest"

// Mocka o config ANTES de importar o módulo testado, já que threadContext.js
// lê config.slack.linkThread no momento da chamada da função.
vi.mock("../../../src/config/env.js", () => ({
    config: {
        slack: {
            linkThread: "https://meuworkspace.slack.com/archives/"
        }
    }
}))

const { buildThreadContext } = await import("./threadContext.js")

describe("buildThreadContext", () => {
    it("monta link simples quando a mensagem não está em thread", () => {
        const originalMessage = { ts: "1784600348.222329" }

        const result = buildThreadContext("C09JP3WKVEX", originalMessage)

        expect(result).toContain("C09JP3WKVEX/p1784600348222329")
        expect(result).toContain('target="_blank"')
        expect(result).toContain("Abrir Thread no Slack")
    })

    it("monta link com thread_ts quando a mensagem é uma reply", () => {
        const originalMessage = {
            ts: "1784601851.954759",
            thread_ts: "1784600348.222329"
        }

        const result = buildThreadContext("C09JP3WKVEX", originalMessage)

        expect(result).toContain("p1784601851954759")
        expect(result).toContain("thread_ts=1784600348222329")
        expect(result).toContain("cid=C09JP3WKVEX")
    })

    it("trata mensagem raiz (thread_ts igual a ts) como link simples", () => {
        const originalMessage = {
            ts: "1784600348.222329",
            thread_ts: "1784600348.222329"
        }

        const result = buildThreadContext("C09JP3WKVEX", originalMessage)

        expect(result).not.toContain("thread_ts=")
        expect(result).toContain("p1784600348222329")
    })
})