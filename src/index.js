import dotenv from "dotenv"
dotenv.config()

import pkg from "@slack/bolt"
const { App } = pkg

import fetch from "node-fetch" 

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
})


app.command("/ticket", async ({ ack, body, client }) => {
    await ack()
    console.log("debug ACK enviado com sucesso")


    await client.views.open({
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            callback_id: "ticket_modal",
            title: { type: "plain_text", text: "Abrir Ticket" },
            submit: { type: "plain_text", text: "Enviar" },
            close: { type: "plain_text", text: "Cancelar" },
            blocks: [
                {
                    type: "input",
                    block_id: "nome",
                    label: { type: "plain_text", text: "Nome completo" },
                    element: { type: "plain_text_input", action_id: "nome_input" },
                },
                {
                    "type": "divider"
                },
                {
                    type: "input",
                    block_id: "email",
                    label: { type: "plain_text", text: "E-mail" },
                    element: { type: "email_text_input", action_id: "email_text_input_action" },
                },
                {
                    "type": "divider"
                },
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
                                options: [                                                                          //a) Alteração De Dados Cadastrais 1197551
                                    { text: { type: "plain_text", text: "a) Alteração de Dados Cadastrais" }, value: "1195946" },
                                    { text: { type: "plain_text", text: "b) Alterar Dados do Merchant (Risco)" }, value: "1226508" },
                                    { text: { type: "plain_text", text: "c) Carta de Circularização" }, value: "carta_circularizacao" },
                                    { text: { type: "plain_text", text: "d) Cadastro de Serviço (Conexões)" }, value: "cadastro_conexao" },
                                    { text: { type: "plain_text", text: "e) Cadastro/Alteração de Plano dos Pagamentos" }, value: "cadastro_alteracao_plan_pag" },
                                    { text: { type: "plain_text", text: "f) Comprovantes" }, value: "solicitacao_comprovantes" },
                                    { text: { type: "plain_text", text: "g) Fluxos" }, value: "add_alt_fluxos" },
                                    { text: { type: "plain_text", text: "h) Repasses" }, value: "repasses" },
                                    { text: { type: "plain_text", text: "i) Identificação de Pagamento do Cliente" }, value: "identificacao_pag_cliente" },
                                    { text: { type: "plain_text", text: "j) Funcionalidades e Melhorias" }, value: "funcionalidades_melhorias" },
                                    { text: { type: "plain_text", text: "k) Reavaliação de Prazos de Recebimentos do Merchant" }, value: "prazo_recebimento_merchant" },
                                    { text: { type: "plain_text", text: "l) OCM – Operational Control Mandate" }, value: "operation_control_mandate" },
                                    { text: { type: "plain_text", text: "m) Criação de Usuários no Movidesk" }, value: "criacao_usuario" },
                                    { text: { type: "plain_text", text: "n) Formulário de Cadastro Tuna" }, value: "formulario_cadastro_tuna" },
                                    { text: { type: "plain_text", text: "o) Quero Cancelar a Minha Conta" }, value: "cancelar_conta" },
                                ],
                            },
                            {
                                label: { type: "plain_text", text: "2 | Problemas" },
                                options: [
                                    { text: { type: "plain_text", text: "a) Acesso ao console" }, value: "acesso_console" },
                                    { text: { type: "plain_text", text: "b) Transações" }, value: "transacoes" },
                                    { text: { type: "plain_text", text: "c) Repasses" }, value: "repasses" },
                                    { text: { type: "plain_text", text: "d) Integração" }, value: "integracao" },
                                    { text: { type: "plain_text", text: "e) Fluxos" }, value: "fluxos" },
                                    { text: { type: "plain_text", text: "f) Serviços" }, value: "servicos" },
                                ],
                            },
                            {
                                label: { type: "plain_text", text: "3 | Antifraude e Segurança" },
                                options: [
                                    { text: { type: "plain_text", text: "a) Análise Manual da Decisão de Antifraude (Decision Manager)" }, value: "analise_manual_antifraude" },
                                    { text: { type: "plain_text", text: "b) Análise da Taxa de Aprovação (Tuning)" }, value: "analise_taxa_aprovacao" },
                                    { text: { type: "plain_text", text: "c) Bloquear Clientes - Antifraudes (Deny List)" }, value: "deny_list" },
                                    { text: { type: "plain_text", text: "d) Liberar clientes - Antifraude (Allow List)" }, value: "allow_list" },
                                    { text: { type: "plain_text", text: "e) Chargebacks (Contestações)" }, value: "chargebacks" },
                                    { text: { type: "plain_text", text: "f) Know Your Customer (KYC)" }, value: "KYC" },
                                    { text: { type: "plain_text", text: "g) Reportar Atividade Suspeita - Fraude/Golpe" }, value: "reportar_fraude_golpe" },
                                ],
                            },
                            {
                                label: { type: "plain_text", text: "4 | Dúvidas" },
                                options: [
                                    { text: { type: "plain_text", text: "a) Dúvida Sobre Taxas" }, value: "duvida_taxas" },
                                    { text: { type: "plain_text", text: "b) Dúvida Sobre Antecipação" }, value: "duvida_antecipacao" },
                                    { text: { type: "plain_text", text: "c) Dúvida sobre Antifraude" }, value: "duvida_antifraude" },
                                    { text: { type: "plain_text", text: "d) Dúvida sobre Bloqueio de Lojas" }, value: "duvida_bloqueio_loja" },
                                    { text: { type: "plain_text", text: "e) Dúvida Sobre Cancelamento" }, value: "duvida_cancelamento" },
                                    { text: { type: "plain_text", text: "f) Outras Dúvidas (Risco/Fraudes)" }, value: "duvida_trisco" },
                                    { text: { type: "plain_text", text: "g) Requisitos para Integração" }, value: "duvida_integracao" },
                                    { text: { type: "plain_text", text: "h) Relatório de Transações" }, value: "relatorio_transacao" },
                                    { text: { type: "plain_text", text: "i) Contrato Comercial" }, value: "contrato_comercial" },
                                    { text: { type: "plain_text", text: "j) Prazo de Repasses" }, value: "duvida_prazo_repasses" },
                                    { text: { type: "plain_text", text: "k) Detalhes de Pagamento" }, value: "duvida_detalhes_pagamento" },
                                    { text: { type: "plain_text", text: "l) Integrações ou Consultas de API" }, value: "duvida_integracoes_API" },

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
                    },

                },
            ],
        },
    })
})



// Recebe o modal e cria o ticket
app.view("ticket_modal", async ({ ack, view, client }) => {
    await ack()

    const servicesMap = {
        1195946: {
            serviceFirstLevelId:1195946 ,
            serviceFirstLevel: "1 | Sou cliente Direto Tuna (Partner)" ,
            serviceSecondLevel: "Solicitações" ,
            serviceThirdLevel: "a) Alteração de Dados Cadastrais"
        },
         1226508: {
            serviceFirstLevelId:1226508 ,
            serviceFirstLevel: "1 | Sou cliente Direto Tuna (Partner)" ,
            serviceSecondLevel: "Solicitações" ,
            serviceThirdLevel: "b) Alterar Dados do Merchant (Risco)"
        }
    }// INSERIR O RESTANTE QUANDO RESOLVER O BUG 

    const nome = view.state.values.nome.nome_input.value
    const email = view.state.values.email.email_text_input_action.value

    const servicoSelecionado = view.state.values.servico.servico_input.selected_option.value
    const servico = servicesMap[servicoSelecionado]

    const categoria = servicesMap[servicoSelecionado]
    const assunto = view.state.values.assunto.assunto_input.value
    const descricao = view.state.values.descricao.descricao_input.value


    console.log("Valores extraídos:", { nome, email, categoria, servico, assunto, descricao })



    const ticketBody = {
        type: 2,
        subject: assunto,
        category: categoria.serviceSecondLevel,
        serviceFirstLevelId: servico?.serviceFirstLevelId,
        serviceFirstLevel:servico?.serviceFirstLevel,
        serviceSecondLevel:servico?.serviceSecondLevel,
        serviceThirdLevel:servico?.serviceThirdLevel,
        urgency: "Média",
        status: "Novo",
        createdBy: {
            id: 123456789, //ID DO AGENTE ?
        },
        clients: [
            {
                id:userId //ERRO
            }
        ],
        actions: [
            {
                type: 2,
                origin: 9,           
                description: "<p>" + descricao + "</p>",
                createdBy: {
                    id: userId //ERRO
                }
            },
            {
                type: 1,
                origin: 9,           
                description: "<p>Ticket Criado Via Slack</p>",
                createdBy: {
                    id: userId //ERRO
                }
            }
        ]
    }

    try {
        const response = await fetch(`https://api.movidesk.com/public/v1/tickets?token=${process.env.MOVIDESK_TOKEN}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketBody),
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`Movidesk API retornou ${response.status}: ${text}`)
        }

        const ticket = await response.json()

        await client.chat.postMessage({
            channel: "#social",
            text: `✅ Ticket criado com sucesso!\n*ID:* ${ticket.id}\n*Protocolo:* ${ticket.protocol}`,
        })

        console.log("Ticket criado e mensagem enviada")
    } catch (error) {
        console.error("Erro ao criar ticket:", error)
        await client.chat.postMessage({
            channel: "#social",
            text: `⚠️ Ocorreu um erro ao criar o ticket: escreve direito e insere as informações nos campos corretos porfa ${error.message}`,
        })
    }
})
    ; (async () => {
        await app.start(process.env.PORT )
        console.log(`bot esta rodando na porta ${process.env.PORT}!!`)
    })()

