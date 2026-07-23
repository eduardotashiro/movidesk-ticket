import type { App } from "@slack/bolt"
import { parseMentions } from "../services/slack/mentionParser.js"
import { isOnlyFiles, isOnlyEmojis } from "../services/slack/messageValidator.js"
import { createTicketFromSlackMessage } from "../services/ticketFlow/createTicketFromSlackMessage.js"
import type { EmailButtonActionBody, EmailModalViewSubmission, EmailModalMetadata, SlackFile, SlackMessage } from "../types/slack.js"

// el action_id "pega_email_btn" es disparado desde events/reactionHandler.js
export function registerEmailModal(app: App): void {
    app.action("pega_email_btn", async ({ ack, body, client }) => {
        await ack()

        const actionBody = body as unknown as EmailButtonActionBody
        const originalTs = actionBody.message.metadata.event_payload.original_message_ts

        const metadata: EmailModalMetadata = {
            channel: actionBody.channel.id,
            button_ts: actionBody.message.ts,
            ts: originalTs,
            messageAuthorId: actionBody.user.id
        }

        await client.views.open({
            trigger_id: actionBody.trigger_id,
            view: {
                type: "modal",
                callback_id: "email_modal",
                private_metadata: JSON.stringify(metadata),
                title: {
                    type: "plain_text",
                    text: "Insira seu email"
                },
                submit: {
                    type: "plain_text",
                    text: "Enviar"
                },
                close: {
                    type: "plain_text",
                    text: "Cancelar"
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "email_block",
                        label: { type: "plain_text", text: "E-mail" },
                        hint: {
                            type: "plain_text",
                            text: "Utilize seu email corporativo"
                        },
                        element: {
                            type: "email_text_input",
                            action_id: "email_input",
                            placeholder: {
                                type: "plain_text",
                                text: "exemplo@empresa.com"
                            }
                        }
                    }
                ]
            }
        })
    })

    app.view("email_modal", async ({ ack, view, client }) => {
        await ack()

        const viewSubmission = view as unknown as EmailModalViewSubmission
        let metadata: EmailModalMetadata | undefined

        try {
            metadata = JSON.parse(viewSubmission.private_metadata)
            const email = viewSubmission.state.values.email_block.email_input.value
            const { channel, ts, messageAuthorId } = metadata as EmailModalMetadata

            const result = await client.conversations.replies({
                channel: channel,
                ts: ts,
            })

            const originalMessage = result.messages?.[0] as SlackMessage
            let text = originalMessage.text
            const files = (originalMessage.files ?? []) as SlackFile[]

            text = await parseMentions(text, client)

            if (isOnlyFiles(text, files)) {
                await client.chat.postMessage({
                    channel: channel,
                    thread_ts: metadata!.button_ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com arquivos. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return

            } else if (isOnlyEmojis(text)) {
                await client.chat.postMessage({
                    channel: channel,
                    thread_ts: metadata!.button_ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com emojis. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return
            }

            await client.chat.update({
                channel: channel,
                ts: metadata!.button_ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })

            const userInfo = await client.users.info({ user: messageAuthorId })
            const name = userInfo.user?.profile?.real_name ?? ""

            await createTicketFromSlackMessage({
                client,
                channel,
                updateTs: metadata!.button_ts,
                attachmentsThreadTs: metadata!.button_ts,
                messageAuthorId,
                email,
                name,
                originalMessage,
                text,
                files
            })

        } catch (error) {
            console.error("Erro ao criar o ticket:", error)

            const fallbackMetadata = metadata ?? JSON.parse(viewSubmission.private_metadata) as EmailModalMetadata
            await client.chat.postMessage({
                channel: fallbackMetadata.channel,
                thread_ts: fallbackMetadata.button_ts,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`,
            })
        }
    })
}