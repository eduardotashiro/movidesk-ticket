import { createTicket } from "../services/movidesk.js"
import { uploadSlackFileToMovidesk } from "../utils/uploadFile.js"
import { ensurePerson } from "../services/persons.js"
import dotenv from "dotenv"

dotenv.config()

export function registerTicketReaction(app) {
    app.event("reaction_added", async ({ event, client }) => {
        console.log("REAÇÃO FEITA!")
        console.log("Usuário:", event.user)
        console.log("Emoji:", event.reaction)
        console.log("Mensagem:", event.item)

        if (event.reaction !== "cactus") return;

        try {
            // Pegar mensagens na thread
            const result = await client.conversations.replies({
                channel: event.item.channel,
                ts: event.item.ts,
            })

            const originalMessage = result.messages[0]
            const text = originalMessage.text;
            const files = originalMessage.files || []



            // Pegar email do usuário que reagiu
            const userInfo = await client.users.info({ user: event.user })
            const email = `teste.${Date.now()}@hotmail.com`//userInfo.user.profile.email
            const name = userInfo.user.profile.real_name

           const movideskId = await ensurePerson(email, name)

            // Criar link da thread
            const threadRootTs = result.messages[0].ts
            const tsForLink = threadRootTs.replace(".", "");
            const threadLink = `${process.env.URL_THREAD_LINK}/${event.item.channel}/p${tsForLink}`
            const threadContext = `<a href="${threadLink}" target="_blank">Abrir thread no Slack</a>`

            // Criar ticket
            const ticket = await createTicket({
                clientId: movideskId,
                assunto: "Ticket via Slack",
                descricao: text,
                servico: null,
                threadContext,
            });

            // Upload de arquivos
            if (files.length > 0) {
                await Promise.all(files.map((f) => uploadSlackFileToMovidesk(ticket.id, f)))
            }

            // Responder na thread com link do ticket
            const linkMovidesk = `${process.env.URL_TICKET_LINK}${ticket.protocol}`
            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${event.user}>.\n\nTicket criado com sucesso! :clap::skin-tone-3:\n\nClique aqui :point_right::skin-tone-3: <${linkMovidesk}|${ticket.protocol}> para acompanhar os detalhes da sua solicitação.`,
            })
        } catch (error) {
            console.error("Erro ao criar o ticket:", error)
            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`,
            })
        }
    })
}
