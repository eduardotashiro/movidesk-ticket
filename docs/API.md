# API - Webhooks

Este bot expõe 4 endpoints HTTP que recebem notificações do Movidesk sobre
mudanças de status em tickets. O Movidesk é configurado para chamar essas
URLs automaticamente quando os eventos correspondentes acontecem.

Todos os endpoints:
- Método: `POST`
- Header obrigatório: `Content-Type: application/json`
- Não exigem autenticação própria (a validação de origem é feita pelo Movidesk
  ao configurar a URL do webhook no painel dele)

---

## POST /webhook/ticket-aguardando-cliente-24h

Disparado quando um ticket está há 24h sem resposta do cliente. O bot avisa
no Slack, na thread original, que o atendimento será encerrado automaticamente
caso não haja retorno.

**Body:**
```json
{ "Id": 95040 }
```

**Resposta:**
```
200 OK
Webhook de 24h recebido com sucesso!
```

**Comportamento interno:**
- Busca os metadados do ticket no banco (`ticket_slack_metadata`) pelo `Id`.
- Se o ticket não for encontrado no banco, a notificação é ignorada
  silenciosamente (log `"tkt não encontrado no db"`).
- Se a notificação já tiver sido enviada antes para esse ticket
  (coluna `webhook_24h_sent`), é ignorada - evita duplicidade.

---

## POST /webhook/ticket-resolvido

Disparado quando um ticket é marcado como resolvido no Movidesk. O bot avisa
no Slack, na thread original, que o atendimento foi concluído.

**Body:**
```json
{ "Id": 95040 }
```

**Resposta:**
```
200 OK
Webhook de resolvido recebido com sucesso!
```

**Comportamento interno:** igual ao endpoint de 24h (busca metadados,
verifica se já foi enviado, evita duplicidade via `webhook_resolve_sent`).

---

## POST /webhook/dedicado-notificado

Disparado por atendimentos dedicados (atualmente configurado para o cliente
Click Bus). Publica um alerta no canal de suporte configurado em `ONLY`.

**Body:**
```json
{ "Id": 95040, "Urgency": "Alta" }
```

**Resposta:**
```
200 OK
```

**Comportamento interno:**
- Verifica duplicidade por uma chave própria (`dedicado-{Id}`) na tabela
  `webhook_duplication_check_only_support`, independente da tabela de
  metadados usada pelos outros dois endpoints acima.
- Busca os dados completos do ticket direto na API do Movidesk (usa
  `MOVIDESK_TOKEN`) para montar o link e o protocolo na mensagem.
- Se `Urgency` não vier no payload, usa `"Não especificada"` como padrão.

---

## POST /webhook/urgente-notificado

Disparado por chamados marcados como urgentes. Publica um alerta no canal de
suporte configurado em `ONLY`, incluindo a organização do cliente.

**Body:**
```json
{ "Id": 95040 }
```

**Resposta:**
```
200 OK
```

**Comportamento interno:** igual ao endpoint de dedicado (chave de
duplicidade própria `urgente-{Id}`, busca dados completos no Movidesk), mas
inclui o nome da organização do cliente na mensagem - se a API do Movidesk
não retornar organização, usa `"Organização não encontrada"`.

---

## Testando localmente

Com o servidor rodando (`npm run dev`), os 4 endpoints podem ser testados
diretamente via `curl`, sem precisar do Slack ou do Movidesk reais:

```bash
# 24h para fechar
curl -X POST http://localhost:3000/webhook/ticket-aguardando-cliente-24h \
  -H "Content-Type: application/json" \
  -d '{"Id": 95040}'

# Resolvido
curl -X POST http://localhost:3000/webhook/ticket-resolvido \
  -H "Content-Type: application/json" \
  -d '{"Id": 95040}'

# Dedicado (Click Bus)
curl -X POST http://localhost:3000/webhook/dedicado-notificado \
  -H "Content-Type: application/json" \
  -d '{"Id": 95040, "Urgency": "Alta"}'

# Urgente
curl -X POST http://localhost:3000/webhook/urgente-notificado \
  -H "Content-Type: application/json" \
  -d '{"Id": 95040}'
```

> Nota: os endpoints de dedicado/urgente sempre respondem `200 OK`, mesmo se
> o `Id` não existir no Movidesk de verdade - o erro é apenas logado no
> servidor, não retornado na resposta HTTP.

---

## Curiosidade: apagando uma mensagem do bot manualmente

Durante testes, às vezes o bot posta uma mensagem que você quer remover
(placeholder que travou, teste que poluiu o canal, etc). Isso não é um
endpoint do bot em si - é a própria API do Slack (`chat.delete`), útil pra
limpeza manual:

```bash
curl -X POST https://slack.com/api/chat.delete \
  -H "Authorization: Bearer xoxb-SEU-BOT-TOKEN-AQUI" \
  -H "Content-Type: application/json" \
  -d '{"channel": "C0XXXXXXX", "ts": "1780369953.857829"}'
```

- `channel`: o ID do canal (não o nome - pega em **View channel details** no Slack).
- `ts`: o timestamp da mensagem, incluindo o ponto decimal. Aparece na URL
  quando você copia o link da mensagem (`.../p1780369953857829` → vira
  `1780369953.857829`, inserindo o ponto antes dos 6 últimos dígitos).
- O bot só pode deletar mensagens que ele mesmo postou - não apaga mensagem
  de outro usuário mesmo com token de admin.

> ⚠️ **Nunca cole o token real num comando de exemplo, mesmo em anotação
> pessoal.** Se ele acabar em algum lugar versionado (commit, print, chat),
> revogue e gere um novo imediatamente em
> **api.slack.com/apps → seu app → OAuth & Permissions → Regenerate Token**.