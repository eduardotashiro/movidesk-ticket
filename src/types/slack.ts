/**
 * Tipos mínimos e pragmáticos: cobrem exatamente os campos que o código lê,
 * em vez de tentar reproduzir os tipos genéricos completos do @slack/bolt
 * (que exigem generics complexos por tipo de evento/action/view).
 */

export interface SlackFile {
    name: string
    filetype: string
    size: number
    url_private: string
}

export interface SlackMessage {
    ts: string
    thread_ts?: string
    text: string
    user: string
    files?: SlackFile[]
}

export interface ReactionAddedEvent {
    reaction: string
    user: string
    item: {
        channel: string
        ts: string
    }
}

export interface AppHomeOpenedEvent {
    user: string
}

export interface EmailButtonActionBody {
    channel: { id: string }
    user: { id: string }
    trigger_id: string
    message: {
        ts: string
        metadata: {
            event_payload: {
                original_message_ts: string
                channel: string
            }
        }
    }
}

export interface EmailModalViewSubmission {
    private_metadata: string
    state: {
        values: {
            email_block: {
                email_input: { value: string }
            }
        }
    }
}

export interface EmailModalMetadata {
    channel: string
    button_ts: string
    ts: string
    messageAuthorId: string
}