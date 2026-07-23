import { parseMentions } from "../services/slack/mentionParser.js"
import { isOnlyFiles, isOnlyEmojis } from "../services/slack/messageValidator.js"
import { createTicketFromSlackMessage } from "../services/ticketFlow/createTicketFromSlackMessage.js"

// el action_id "pega_email_btn" es disparado desde events/reactionHandler.js
export function registerEmailModal(app) {
    app.action("pega_email_btn", async ({ ack, body, client }) => {
        await ack()
        const originalTs = body.message.metadata.event_payload.original_message_ts

        const metadata = {
            channel: body.channel.id,
            button_ts: body.message.ts,
            ts: originalTs,
            messageAuthorId: body.user.id
        }

       // console.log("ACTION BODY:", JSON.stringify(body, null, 2))

        await client.views.open({
            trigger_id: body.trigger_id,
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

        try {
            const metadata = JSON.parse(view.private_metadata)
            const vsv = view.state.values
            const email = vsv.email_block.email_input.value
            const { channel, ts, messageAuthorId } = metadata

            const result = await client.conversations.replies({
                channel: channel,
                ts: ts,
            })

            const originalMessage = result.messages[0]
            let text = originalMessage.text
            const files = originalMessage.files || []

            // console.log(`----------------------`)
            // console.log(`Quantidade de arquivos, ${files.length}`)
            // console.log(`arquivos completos, ${JSON.stringify(files, null, 2)}`)
            // console.log(`mensagem original completa ${JSON.stringify(originalMessage, null, 2)}`)
            // console.log(`----------------------`)

            text = await parseMentions(text, client)

            if (isOnlyFiles(text, files)) {
                await client.chat.postMessage({
                    channel: channel,
                    thread_ts: metadata.button_ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com arquivos. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return

            } else if (isOnlyEmojis(text)) {
                await client.chat.postMessage({
                    channel: channel,
                    thread_ts: metadata.button_ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com emojis. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })
                return
            }

            await client.chat.update({
                channel: channel,
                ts: metadata.button_ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })

            const userInfo = await client.users.info({ user: messageAuthorId })
            const name = userInfo.user.profile.real_name

            await createTicketFromSlackMessage({
                client,
                channel,
                updateTs: metadata.button_ts,
                attachmentsThreadTs: metadata.button_ts,
                messageAuthorId,
                email,
                name,
                originalMessage,
                text,
                files
            })

        } catch (error) {
            console.error("Erro ao criar o ticket:", error)

            const metadata = JSON.parse(view.private_metadata)
            await client.chat.postMessage({
                channel: metadata.channel,
                thread_ts: metadata.button_ts,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`,
            })
        }
    })
}