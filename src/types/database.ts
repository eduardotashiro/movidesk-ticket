export enum WebhookType {
    Created = 1,
    Updated = 2,
    Deleted = 3
}

export interface TicketMetadata {
    slackThreadTs: string
    slackChannelId: string
    movideskTicketId: number
}

export interface WebhookStatus {
    ticketId: number
    notificationType: string
}