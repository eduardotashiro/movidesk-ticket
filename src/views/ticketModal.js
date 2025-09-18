import { servicesMap } from "../utils/servicesMap.js"
import { createTicket } from "../services/movidesk.js"
import { readEmail } from "../utils/fileReader.js"


export function buildTicketModal() {
    return {
        type: "modal",
        callback_id: "ticket_modal",
        title: { type: "plain_text", text: "Abrir Ticket" },
        submit: { type: "plain_text", text: "Enviar" },
        close: { type: "plain_text", text: "Cancelar" },
        blocks: [
            {
                type: "input",
                block_id: "servico",
                label: { type: "plain_text", text: "Serviço" },
                element: {
                    type: "static_select",
                    action_id: "servico_input",
                    option_groups: [
                        {
                            label: { type: "plain_text", text: "1 | Solicitações" },
                            options: [
                                { text: { type: "plain_text", text: "a) Alteração de Dados Cadastrais" }, value: "1195946" },
                                { text: { type: "plain_text", text: "b) Alterar Dados do Merchant (Risco)" }, value: "1226508" },
                                { text: { type: "plain_text", text: "c) Carta de Circularização" }, value: "1244237" },
                                { text: { type: "plain_text", text: "d) Cadastro de Serviço (Conexões)" }, value: "1195992" },
                                { text: { type: "plain_text", text: "e) Cadastro/Alteração de Plano dos Pagamentos" }, value: "1195993" },
                                { text: { type: "plain_text", text: "f) Comprovantes" }, value: "1195995" },
                                { text: { type: "plain_text", text: "g) Fluxos" }, value: "1196029" },
                                { text: { type: "plain_text", text: "h) Repasses" }, value: "1196022" },
                                { text: { type: "plain_text", text: "i) Identificação de Pagamento do Cliente" }, value: "1196051" },
                                { text: { type: "plain_text", text: "j) Funcionalidades e Melhorias" }, value: "1196053" },
                                { text: { type: "plain_text", text: "k) Reavaliação de Prazos de Recebimentos do Merchant" }, value: "1196048" },
                                { text: { type: "plain_text", text: "l) OCM – Operational Control Mandate" }, value: "1344608" },
                                { text: { type: "plain_text", text: "m) Criação de Usuários no Movidesk" }, value: "1195994" },
                                { text: { type: "plain_text", text: "n) Formulário de Cadastro Tuna" }, value: "1238553" },
                                { text: { type: "plain_text", text: "o) Quero Cancelar a Minha Conta" }, value: "1196055" },
                            ],
                        },
                        {
                            label: { type: "plain_text", text: "2 | Problemas" },
                            options: [
                                { text: { type: "plain_text", text: "a) Acesso ao console" }, value: "1196095" },
                                { text: { type: "plain_text", text: "b) Transações" }, value: "1196113" },
                                { text: { type: "plain_text", text: "c) Repasses" }, value: "1196152" },
                                { text: { type: "plain_text", text: "d) Integração" }, value: "1196153" },
                                { text: { type: "plain_text", text: "e) Fluxos" }, value: "1196154" },
                                { text: { type: "plain_text", text: "f) Serviços" }, value: "1196155" },
                            ],
                        },
                        {
                            label: { type: "plain_text", text: "3 | Antifraude e Segurança" },
                            options: [
                                { text: { type: "plain_text", text: "a) Análise Manual da Decisão de Antifraude (Decision Manager)" }, value: "1196200" },
                                { text: { type: "plain_text", text: "b) Análise da Taxa de Aprovação (Tuning)" }, value: "1196204" },
                                { text: { type: "plain_text", text: "c) Bloquear Clientes - Antifraudes (Deny List)" }, value: "1196211" },
                                { text: { type: "plain_text", text: "d) Liberar clientes - Antifraude (Allow List)" }, value: "1196214" },
                                { text: { type: "plain_text", text: "e) Chargebacks (Contestações)" }, value: "1196218" },
                                { text: { type: "plain_text", text: "f) Know Your Customer (KYC)" }, value: "1196220" },
                                { text: { type: "plain_text", text: "g) Reportar Atividade Suspeita - Fraude/Golpe" }, value: "1196221" },
                            ],
                        },
                        {
                            label: { type: "plain_text", text: "4 | Dúvidas" },
                            options: [
                                { text: { type: "plain_text", text: "a) Dúvida Sobre Taxas" }, value: "1196223" },
                                { text: { type: "plain_text", text: "b) Dúvida Sobre Antecipação" }, value: "1196224" },
                                { text: { type: "plain_text", text: "c) Dúvida sobre Antifraude" }, value: "1196225" },
                                { text: { type: "plain_text", text: "d) Dúvida sobre Bloqueio de Lojas" }, value: "1196226" },
                                { text: { type: "plain_text", text: "e) Dúvida Sobre Cancelamento" }, value: "1196228" },
                                { text: { type: "plain_text", text: "f) Outras Dúvidas (Risco/Fraudes)" }, value: "1196229" },
                                { text: { type: "plain_text", text: "g) Requisitos para Integração" }, value: "1196230" },
                                { text: { type: "plain_text", text: "h) Relatório de Transações" }, value: "1196232" },
                                { text: { type: "plain_text", text: "i) Contrato Comercial" }, value: "1196234" },
                                { text: { type: "plain_text", text: "j) Prazo de Repasses" }, value: "1199383" },
                                { text: { type: "plain_text", text: "k) Detalhes de Pagamento" }, value: "1225228" },
                                { text: { type: "plain_text", text: "l) Transações" }, value: "1225896" },
                                { text: { type: "plain_text", text: "m) Efeito de Contrato" }, value: "1234468" },
                                { text: { type: "plain_text", text: "n) Integrações ou Consultas de API" }, value: "1314886" },

                            ],
                        },
                    ],
                },
            },
            {
                "type": "divider"
            },
            {
                type: "input",
                block_id: "assunto",
                label: { type: "plain_text", text: "Assunto do ticket" },
                element: { type: "plain_text_input", action_id: "assunto_input" },
            },
            {
                "type": "divider"
            },
            {
                type: "input",
                block_id: "descricao",
                element: {
                    type: "plain_text_input",
                    multiline: true, action_id: "descricao_input"
                },
                label: {
                    type: "plain_text", text: "Descrição do Ticket"
                }
            },
           /* {
                title: {
                    type: "plain_text",
                    text: "Upload a Document"
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "file_upload_block",
                        label: {
                            type: "plain_text",
                            text: "Select your document"
                        },
                        element: {
                            type: "file_input",
                            action_id: "document_file_input",
                            filetypes: ["pdf", "doc", "docx"],
                            max_files: 1
                        }
                    }
                ],
                submit: {
                    type: "plain_text",
                    text: "Submit"
                }
            }*/

        ],
    }
}

const users = readEmail('/home/odraude/Área de trabalho/ticket/src/private/userInfo.json')

function getIdByEmail(email) {
    return users.find(u => u.email === email) || null
}


export function registerTicketModal(app) {
    app.view("ticket_modal", async ({ ack, view, body, client }) => {
        await ack()

        const servicoSelecionado = view.state.values.servico.servico_input.selected_option.value
        const servico = servicesMap[servicoSelecionado]
        const assunto = view.state.values.assunto.assunto_input.value
        const descricao = view.state.values.descricao.descricao_input.value

        // PEGA O CANAL DO private_metadata
        const channelId = body.view?.private_metadata;
        if (!channelId) {
            console.error("Canal não definido para enviar a mensagem");
            console.log("body.view:", body.view);
            return;
        }
        console.log("Canal para enviar mensagem:", channelId);


        //Pega o userId do submitter
        const userId = body.user.id

        // Busca infos do usuário no Slack
        let email
        try {
            const userInfo = await client.users.info({ user: userId })
            email = userInfo.user.profile.email;
        } catch (err) {
            await client.chat.postMessage({
                channel: channelId,
                text: `Não consegui buscar o email do usuário: ${err.message}`,
            })
            return
        }

        // Localiza no arquivo JSON 
        const user = getIdByEmail(email);

        if (!user) {
            await client.chat.postMessage({
                channel: channelId,
                text: `Email não encontrado no JSON -> ${email}`,
            });
            return;
        }


        try {
            const ticket = await createTicket({
                clientId: user.id, // id do json
                assunto,
                descricao,
                servico
            })

            await client.chat.postMessage({
                channel: channelId,
                text: `Ticket criado com sucesso!\n*Protocolo:* ${ticket.protocol}`,
            })
        } catch (error) {
            await client.chat.postMessage({
                channel: channelId,
                text: `Erro ao criar o ticket: ${error.message}`,
            })
        }
    })
}

