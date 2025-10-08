import { createTicket } from "../services/movidesk.js"
import { uploadSlackFileToMovidesk } from "../utils/uploadFile.js"
import { getOrCreatePerson } from "../services/persons.js"
import dotenv from "dotenv"

dotenv.config()

export function registerTicketReaction(app) {
    app.event("reaction_added", async ({ event, client }) => {
        console.log("REAÇÃO FEITA!")
        console.log("Usuário:", event.user)
        console.log("Emoji:", event.reaction)
        console.log("Mensagem:", event.item)


        if (event.reaction !== "sos") return //cactus ?!

        try {
            // Pegar mensagens na thread
            const result = await client.conversations.replies({
                channel: event.item.channel,
                ts: event.item.ts,
            })

            const originalMessage = result.messages[0]
            const text = originalMessage.text
            const files = originalMessage.files || []
            const messageAuthorId = originalMessage.user

            const placeholder = await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })

            const placeholderTs = placeholder.ts

            // Pega infos do autor da mensagem
            const messageAuthorInfo = await client.users.info({ user: messageAuthorId })
            const email = `${Date.now()}@gmail.com`//messageAuthorInfo.user.profile.email
            const name = messageAuthorInfo.user.profile.real_name


            const movideskId = await getOrCreatePerson(email, name)


            const threadOrigin = result.messages[0].ts
            const tsForLink = threadOrigin.replace(".", "")
            const threadLink = `${process.env.URL_THREAD_LINK}/${event.item.channel}/p${tsForLink}`
            const threadContext = `<a href="${threadLink}" target="_blank">Abrir thread no Slack</a>`


            const ticket = await createTicket({
                clientId: movideskId,
                assunto: `Ticket via Slack: ${text.substring(0,69)}`,
                descricao: text,
                servico: null,
                threadContext,
            })

            // Responder na thread com link do ticket
            const linkMovidesk = `${process.env.URL_TICKET_LINK}${ticket.protocol}`
            await client.chat.update({
                channel: event.item.channel,
                ts: placeholderTs,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nSeu ticket foi criado com sucesso no Movidesk!:tada:\n\nVocê pode acompanhar os detalhes da sua solicitação aqui: <${linkMovidesk}|${ticket.protocol}>\n\nObrigado por reportar o problema! Nossa equipe irá tratá-lo por lá. `,
            })

            console.log("Ticket completo:", JSON.stringify(ticket, null, 2))


            const fullTicket = await fetch(`${process.env.MOVIDESK_API}/public/v1/tickets?token=${process.env.MOVIDESK_TOKEN}&id=${ticket.id}`)
            console.log(fullTicket)


            // Upload de arquivos
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
}
