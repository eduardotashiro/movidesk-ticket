import { readIdSlack, getMovideskId } from "../utils/reactionReader.js"
import { createTicket } from "../services/movidesk.js"
import { uploadSlackFileToMovidesk } from "../utils/uploadFile.js"

import dotenv from "dotenv"

dotenv.config()


export function registerTicketReaction(app) {
    app.event('reaction_added', async ({ event, client }) => {
        console.log('REAÇÃO FEITA!')
        console.log('Usuário:', event.user)
        console.log('Emoji:', event.reaction)
        console.log('Mensagem:', event.item)


        if (event.reaction !== "cactus") return;

        try {

            // pegar mensagens na thread
            const result = await client.conversations.replies({
                channel: event.item.channel,
                ts: event.item.ts
            });


            const originalMessage = result.messages[0] // mensagem que o usuário enviou
            const text = originalMessage.text


            // Pega os arquivos anexados, se houver
            const files = originalMessage.files || [] // array de arquivos


            // le JSON de usuários usando função importada | futuramente embutir json em DB
            const users = readIdSlack(process.env.USER_JSON_PATH)

            // buscar ID do Movidesk usando função importada
            const movideskId = getMovideskId(users, event.user)


            //const userInfo = await client.users.info({ user: })
            //const email = userInfo.user.profile.email


            if (!movideskId) {
                await client.chat.postMessage({
                    channel: event.item.channel,
                    thread_ts: event.item.ts,
                    text: `:warning: Olá <@${event.user}>!\n\nNão encontrei seu usuário vinculado ao Movidesk.\n\n:point_right: Para prosseguir, é necessário cadastrar sua conta do Movidesk.\n\nPor favor, entre em contato com sua equipe para solicitar o cadastro.`
                });
                return;
            }


            //Cria link da thread
            const threadRootTs = result.messages[0].ts
            const tsForLink = threadRootTs.replace('.', '')
            const threadLink = `${process.env.URL_THREAD_LINK}/${event.item.channel}/p${tsForLink}`

            const threadContext = `<a href="${threadLink}" target="_blank">Abrir thread no Slack</a>` //abrir em outra aba

            const ticket = await createTicket({
                clientId: movideskId,
                assunto: "Ticket via Slack",
                descricao: text,
                servico: null,
                threadContext
            })


            //Baixa e envia os arquivos para o Movidesk
            if (files.length > 0) {
                await Promise.all(files.map(f => uploadSlackFileToMovidesk(ticket.id, f))); //dispara todos os uploads em paralelo uma única vez.---

            }


            // responder na thread
            const linkMovidesk = `${process.env.URL_LINK}${ticket.protocol}`

            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `Olá <@${event.user}>.\n\nTicket criado com sucesso ! :clap::skin-tone-3:\n\nClique aqui  :point_right::skin-tone-3: <${linkMovidesk}|${ticket.protocol}> para acompanhar os detalhes da sua solicitação.`
            });

        } catch (error) {
            console.error("Erro ao criar o ticket:", error);
            await client.chat.postMessage({
                channel: event.item.channel,
                thread_ts: event.item.ts,
                text: `:warning: Ocorreu um problema ao criar seu ticket.\n\nNossa equipe já foi notificada e vamos resolver em breve.\n\nPor favor, tente novamente mais tarde.`
            })
        }
    })
}
