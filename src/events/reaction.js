import { config } from "../config/env.js"
import { uploadSlackFileToMovidesk } from "../utils/uploadFile.js"
import { getOrCreatePerson } from "../services/persons.js"
import { ticketCounter , catchMetadata, catchInfo } from "../db/dbQueries.js"
import { createTicket } from "../services/movidesk.js"


export function registerTicketReaction(app) {
    app.event("reaction_added", async ({ event, client }) => {
        // Escuta quando uma reação é adicionada no Slack

        console.log("----REAÇÃO FEITA!-----")
        console.log("Usuário:", event.user)
        console.log("Emoji:", event.reaction)
        console.log("Mensagem:", event.item)
        console.log("----------------------")

        // só reage se o emoji for SOS
        if (event.reaction !== "sos") return

        try {
            //incremeta o contador no bd
            await ticketCounter()


            //pega mensagem na thread // CHANNEL
            const result = await client.conversations.replies({
                channel: event.item.channel,
                ts: event.item.ts,
            })

            const originalMessage = result.messages[0]
            let text = originalMessage.text
            const files = originalMessage.files || [] // aqui guadei o arquivo
            const messageAuthorId = originalMessage.user

            // substitui menções <@ID> pelo nome real quando for para o movidesk
            const mention = /<@([A-Z0-9]+)>/g
            const matches = [...text.matchAll(mention)]

            for (const match of matches) {
                const userId = match[1]
                const userInfo = await client.users.info({ user: userId })
                const realName = userInfo.user.profile.real_name
                text = text.replace(match[0], realName)
            }

            // apenas arquivo n cria ticket
            if ((!text || !text.trim()) && files.length > 0) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com arquivos. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })

                return

                //apenas emoji não cria ticket 
            } else if (/^(:[a-z0-9_+-]+:\s*)+$/gi.test(text.trim())) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com emojis. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })

                return

            }




            // Pega info do autor 
            const messageAuthorInfo = await client.users.info({ user: messageAuthorId })
            const email = undefined //`${Date.now()}@teste.com`  | undefined undefined// m
            const name = messageAuthorInfo.user.profile.real_name //





            //COMEÇO NOVA FEAT
            // se email é undefined, pede via modal
            if (!email || email === undefined) {
                 await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `É necessario um email valido para a criação de um ticket`,
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
                return // entao aqui eu coloco tudo que esta la em baixo para pegar o file corretamente ??
            }
            // FIM NOVA FEAT

            const placeholder = await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })
            const placeholderTs = placeholder.ts


            //busca, se der false, cria ! 
            const movideskId = await getOrCreatePerson(email, name)

            console.log("msg dentro da thread", originalMessage.ts)
            console.log("msg raiz da thread:", originalMessage.thread_ts)

            /*************/

            let threadContext;

            if (originalMessage.thread_ts && originalMessage.thread_ts !== originalMessage.ts) {

                const messageTsFormatted = originalMessage.ts.replace('.', '')

                const threadTsFormatted = originalMessage.thread_ts.replace('.', '')

                let threadLink = `${config.slack.linkThread}${event.item.channel}/p${messageTsFormatted}?thread_ts=${threadTsFormatted}&cid=${event.item.channel}`;

                threadContext = `<a href="${threadLink}"target="_blank">Abrir Thread no Slack</a>`;

            } else {

                const t = `${config.slack.linkThread}${event.item.channel}/p${originalMessage.ts.replace('.', '')}`
                threadContext = `<a href="${t}"target="_blank">Abrir Thread no Slack</a>`;
            }

// parei aqui

            /*************/

            // Cria o ticket no Movidesk
            const ticket = await createTicket({
                clientId: movideskId,
                assunto: `Ticket via Slack: ${text.substring(0, 69)}`,
                descricao: text,
                servico: null,
                threadContext,
            })

            
            
            
            // Atualiza placeholder com link do ticket
            const linkMovidesk = `${config.movidesk.urlTicketLink}${ticket.protocol}`
            await client.chat.update({
                channel: event.item.channel,
                ts: placeholderTs,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nSeu ticket foi criado na *Central de Ajuda Tuna*.  Acompanhe sua solicitação em: <${linkMovidesk}|${ticket.protocol}>.\n\n\`\`\`Se for seu primeiro acesso, acesse "Obter uma senha" na página de login.\`\`\`\nAgradecemos sua atenção.`,
            })
            
            //chama func para insert
            
            console.log("Ticket completo:", JSON.stringify(ticket, null, 2))
           
            
            catchMetadata(ticket.id,placeholderTs,event.item.channel,messageAuthorId,ticket.protocol,linkMovidesk);
       


// Ticket completo: {
//   "id": 58896,
//   "protocol": "202601280001308"
// }


            const fullTicket = await fetch(`${config.movidesk.urlCreateTicket}${config.movidesk.token}&id=${ticket.id}`)
            console.log(fullTicket)


            // Upload de arquivos, se tiver
            if (files.length > 0) {
                await Promise.all(files.map((f) => uploadSlackFileToMovidesk(ticket.id, f)))
            }



        } catch (error) {
            console.error("Erro ao criar o ticket:", error)

            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: placeholderTs,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`,
            })
        }
    })













































    app.action("pega_email_btn", async ({ ack, body, client }) => {
        await ack()

        const metadata = {
            channel: body.channel.id,
            button_ts: body.message.ts, //dddddddddddddddddddddddddddddddddddd
            ts: body.message.thread_ts || body.message.ts,
            messageAuthorId: body.user.id
        }

        console.log("ACTION BODY:", JSON.stringify(body, null, 2))

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














//DUPLICATED



  
    app.view("email_modal", async ({ ack, view, client }) => {
        await ack()

        try {
            const metadata = JSON.parse(view.private_metadata)
            const vsv = view.state.values
            const email = vsv.email_block.email_input.value
            const { channel, ts, messageAuthorId } = metadata

            //pega mensagem na thread
            const result = await client.conversations.replies({
                channel: channel,
                ts: ts,
            })

            const originalMessage = result.messages[0]
            // const slackThreadTs = result.thread_ts ?? result.ts
            let text = originalMessage.text
            const files = originalMessage.files || []




            // substitui menções <@ID> pelo nome real quando for para o movidesk
            const mention = /<@([A-Z0-9]+)>/g
            const matches = [...text.matchAll(mention)]

            for (const match of matches) {
                const userId = match[1]
                const userInfo = await client.users.info({ user: userId })
                const realName = userInfo.user.profile.real_name
                text = text.replace(match[0], realName)
            }

            // apenas arquivo n cria ticket
            if ((!text || !text.trim()) && files.length > 0) {
                await client.chat.postMessage({
                    channel: channel,
                    thread_ts: metadata.button_ts,
                    text: `Olá <@${messageAuthorId}>,\n\nAinda não consigo criar Ticket no Suporte apenas com arquivos. :sweat_smile:\n\nPor favor tente novamente em uma mensagem que contenha textos também.`
                })

                return

                //apenas emoji não cria ticket 
            } else if (/^(:[a-z0-9_+-]+:\s*)+$/gi.test(text.trim())) {
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
            //busca, se der false, cria ! 
            const movideskId = await getOrCreatePerson(email, name)

            console.log("msg dentro da thread", originalMessage.ts)
            console.log("msg raiz da thread:", originalMessage.thread_ts)

            /*************/

            let threadContext;

            if (originalMessage.thread_ts && originalMessage.thread_ts !== originalMessage.ts) {

                const messageTsFormatted = originalMessage.ts.replace('.', '')

                const threadTsFormatted = originalMessage.thread_ts.replace('.', '')

                let threadLink = `${config.slack.linkThread}${channel}/p${messageTsFormatted}?thread_ts=${threadTsFormatted}&cid=${channel}`;;

                threadContext = `<a href="${threadLink}"target="_blank">Abrir Thread no Slack</a>`;

            } else {

                const t = `${config.slack.linkThread}${channel}/p${originalMessage.ts.replace('.', '')}`
                threadContext = `<a href="${t}"target="_blank">Abrir Thread no Slack</a>`;
            }


            /*************/

            // Cria o ticket no Movidesk
            const ticket = await createTicket({
                clientId: movideskId,
                assunto: `Ticket via Slack: ${text.substring(0, 69)}`,
                descricao: text,
                servico: null,
                threadContext,
            })

            
            // Atualiza placeholder com link do ticket
            const linkMovidesk = `${config.movidesk.urlTicketLink}${ticket.protocol}`
            await client.chat.update({
                channel: channel,
                ts: metadata.button_ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nSeu ticket foi criado na *Central de Ajuda Tuna*.  Acompanhe sua solicitação em: <${linkMovidesk}|${ticket.protocol}>.\n\n\`\`\`Se for seu primeiro acesso, acesse "Obter uma senha" na página de login.\`\`\`\nAgradecemos sua atenção.`,
            })
            
            console.log("Ticket completo:", JSON.stringify(ticket, null, 2))
            
            //chama func para insert
//chama func para insert
            catchMetadata(ticket.id,metadata.button_ts,channel,messageAuthorId,ticket.protocol,linkMovidesk);
            
            const fullTicket = await fetch(`${config.movidesk.urlCreateTicket}${config.movidesk.token}&id=${ticket.id}`)
            console.log(fullTicket)


            // Upload de arquivos, se tiver
            if (files.length > 0) {
                await Promise.all(files.map((f) => uploadSlackFileToMovidesk(ticket.id, f)))
            }

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






//RESOLVID

export async function ticketResolve(app, webhook_ticket_id) {
    const resultDB = await catchInfo(webhook_ticket_id)
    try {
      if (!resultDB) {
        console.log(`tkt não encontrado no db`)
        return
      }

      await app.client.chat.postMessage({
          channel: resultDB.slack_channel_id,
          thread_ts: resultDB.slack_thread_ts,                           
          text:`Olá <@${resultDB.user_id}>,\n\nSeu atendimento <${resultDB.threadcontext}|${resultDB.protocol}> foi concluído :check:\n\nPermanecemos à disposição.`
        })
// <${linkMovidesk}|${ticket.protocol}> threadContext
    } catch (error) {
      console.log(`erro ao enviar resolvido no slack:`, error.message)
    }
}
