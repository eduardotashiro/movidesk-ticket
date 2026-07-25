import type { App } from "@slack/bolt"
import { incrementTicketCounter } from "../db/queries/ticketMetrics.js"
import { checkTicketExists } from "../db/queries/ticketMetadata.js"
import { parseMentions } from "../services/slack/mentionParser.js"
import { isOnlyFiles, isOnlyEmojis } from "../services/slack/messageValidator.js"
import { createTicketFromSlackMessage } from "../services/ticketFlow/createTicketFromSlackMessage.js"
import type { SlackFile, SlackMessage } from "../types/slack.js"

export function registerReactionHandler(app: App): void {
    app.event("reaction_added", async ({ event, client }) => {

        if (event.reaction !== "sos") return

        const alreadyExists = await checkTicketExists(event.item.channel, event.item.ts)

        if (alreadyExists) {
            console.log(`Ticket já existe para a mensagem ${event.item.ts} no canal ${event.item.channel}. Ignorando.`)
            return
        }

        let placeholderTs: string | undefined

        try {
            await incrementTicketCounter()

            const result = await client.conversations.replies({
                channel: event.item.channel,
                ts: event.item.ts,
            })

            const originalMessage = result.messages?.[0] as SlackMessage
            let text = originalMessage.text
            const files = (originalMessage.files ?? []) as SlackFile[]
            const messageAuthorId = originalMessage.user

            text = await parseMentions(text, client)

            if (isOnlyFiles(text, files)) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com arquivos. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return

            } else if (isOnlyEmojis(text)) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com emojis. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return
            }

            const messageAuthorInfo = await client.users.info({ user: messageAuthorId })
            const email = undefined// messageAuthorInfo.user?.profile?.email
            const name = messageAuthorInfo.user?.profile?.real_name ?? ""

            // si el usuario no tiene email registrado en slack, se le pide vía modal
            if (!email) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `É necessario um email valido para a criação de um ticket`,
                    metadata: {
                        event_type: "solicitar_email",
                        event_payload: {
                            original_message_ts: event.item.ts,
                            channel: event.item.channel
                        }
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nPreciso do seu e-mail para criar o ticket.\n\n`
                            }
                        },
                        {
                            type: "actions",
                            elements: [
                                {
                                    type: "button",
                                    text: { type: "plain_text", text: "Informar E-mail" },
                                    action_id: "pega_email_btn",
                                    style: "primary"
                                }
                            ]
                        }
                    ]
                })
                return
            }

            const placeholder = await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })
            placeholderTs = placeholder.ts

            await createTicketFromSlackMessage({
                client,
                channel: event.item.channel,
                updateTs: placeholderTs as string,
                attachmentsThreadTs: event.item.ts,
                messageAuthorId,
                email,
                name,
                originalMessage,
                text,
                files
            })

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            console.error("Erro ao criar o ticket:", message)
            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: placeholderTs || event.item.ts,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`,
            })
        }
    })
}