export interface MovideskPerson {
    id: number
    isActive: boolean
    relationships?: MovideskRelationship[]
}

export interface MovideskRelationship {
    id: string | undefined
    name?: string | undefined
    slaAgreement?: string | undefined
    allowAllServices?: boolean
    forceChildrenToHaveSomeAgreement?: boolean
}

export interface CreateTicketInput {
    clientId: number
    assunto: string
    descricao: string
    threadContext: string
    servico?: null
}

export interface TicketResponse {
    id: number
    protocol: string
}

export interface MovideskTicketFull {
    protocol?: string
    clients?: Array<{
        organization?: { businessName?: string }
    }>
}

export interface DedicatedWebhookPayload {
    Id: number
    Urgency?: string
}

export interface UrgentWebhookPayload {
    Id: number
}