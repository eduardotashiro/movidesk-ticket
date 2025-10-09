import { createTicket } from "../services/movidesk.js"
import { uploadSlackFileToMovidesk } from "../utils/uploadFile.js"
import { getOrCreatePerson } from "../services/persons.js"
import dotenv from "dotenv"

dotenv.config()


export function registerTicketReaction(app) {
    app.event("reaction_added", async ({ event, client }) => {
        // Escuta quando uma reação é adicionada no Slack

        console.log("----REAÇÃO FEITA!-----")
        console.log("Usuário:", event.user  )
        console.log("Emoji:", event.reaction)
        console.log("Mensagem:", event.item )
        console.log("----------------------")

        // só reage se o emoji for SOS
        if (event.reaction !== "sos") return 

        try {
            //busca apenas a mensagem que teve a reação
            const result = await client.conversations.history({
                channel: event.item.channel,
                latest: event.item.ts,
                limit: 1,
                inclusive: true
            })

            const originalMessage = result.messages[0]
            let text = originalMessage.text
            const files = originalMessage.files || []
            const messageAuthorId = originalMessage.user

            // Substitui menções <@ID> pelo nome real quando for para o movidesk
            const mention = /<@([A-Z0-9]+)>/g
            const matches = [...text.matchAll(mention)]

            for (const match of matches) {
                const userId = match[1]
                const userInfo = await client.users.info({ user: userId })
                const realName = userInfo.user.profile.real_name
                text = text.replace(match[0], realName)
            }

            // 'Placeholder' na thread enquanto cria o ticket, feedback para quem reage ficar na paz, só de arquivos não se cria
            if (!text.trim()){
            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${messageAuthorId}>,\n\nInfelizmente não consigo criar ticket apenas com arquivos, precisa escrever o problema junto :sweat_smile:`
            }) 

            return

        } 

            const placeholder = await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4: \n\nSeu ticket esta sendo criado ... `
            })

            const placeholderTs = placeholder.ts


             // Pega info do autor 
            const messageAuthorInfo = await client.users.info({ user: messageAuthorId })
            const email = messageAuthorInfo.user.profile.email //`${Date.now()}@gmail.com` 
            const name = messageAuthorInfo.user.profile.real_name

            //busca, se der false, cria ! 
            const movideskId = await getOrCreatePerson(email, name)

            // Link da thread para enviar p/ movidesk
            const threadOrigin = result.messages[0].ts
            const tsForLink = threadOrigin.replace(".", "")
            const threadLink = `${process.env.URL_THREAD_LINK}/${event.item.channel}/p${tsForLink}`
            const threadContext = `<a href="${threadLink}" target="_blank">Abrir thread no Slack</a>`

            // Cria o ticket no Movidesk
            const ticket = await createTicket({
                clientId: movideskId,
                assunto: `Ticket via Slack: ${text.substring(0, 69)}`,
                descricao: text,
                servico: null,
                threadContext,
            })

            // Atualiza placeholder com link do ticket
            const linkMovidesk = `${process.env.URL_TICKET_LINK}${ticket.protocol}`
            await client.chat.update({
                channel: event.item.channel,
                ts: placeholderTs,
                text: `Olá <@${messageAuthorId}> :wave::skin-tone-4:\n\nSeu ticket foi criado com sucesso no Movidesk ! :tada:\n\nVocê pode acompanhar os detalhes da sua solicitação aqui: <${linkMovidesk}|${ticket.protocol}>\n\nObrigado por reportar o problema! Nossa equipe irá tratá-lo por lá. `,
            })

            console.log("Ticket completo:", JSON.stringify(ticket, null, 2))


            const fullTicket = await fetch(`${process.env.MOVIDESK_API}/public/v1/tickets?token=${process.env.MOVIDESK_TOKEN}&id=${ticket.id}`)
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
}
