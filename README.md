# Slack + Movidesk Integration

Bot que transforma reações do Slack em tickets no Movidesk automaticamente !

## Funcionalidades
-  Reação 🆘 cria ticket
-  Upload de arquivos 
-  **Busca** | **Cria** | **Ativa** usuários antes de criar o ticket
-  Feedback em tempo real na Thread do Slack.

## Tecnologias
- Node.js 
- Slack Bolt
- Movidesk API

## Referências

Integração construída sobre as APIs públicas do Movidesk:  

- [Ticket API](https://atendimento.movidesk.com/kb/pt-br/article/256/movidesk-ticket-api)  

- [Person API](https://atendimento.movidesk.com/kb/pt-br/article/189/movidesk-person-api)  

- [Attachments API](https://atendimento.movidesk.com/kb/pt-br/article/518585/api-de-anexos)


## Como usar 
```bash
git clone https://github.com/eduardotashiro/movidesk-ticket.git

cd movidesk-ticket

npm install
```
> Copie o .env.example e preencha com suas credenciais

## executando

```
npm start
```
>O bot vai escutar reações no Slack e criar tickets automaticamente no Movidesk.

---

***MIT*** © **[Eduardo Tashiro]()**