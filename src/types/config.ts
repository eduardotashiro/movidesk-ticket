export interface Relationship  {
    id: string | undefined
    name: string | undefined
    slaAgreement?: string | undefined
}

export interface Config {
    port: string | undefined
    slack: {
        signingSecret: string | undefined
        botToken: string | undefined
        linkThread: string | undefined
        bannerHome: string | undefined
        channel: string | undefined
    }
    dataBase: {
        url: string | undefined
    }
    movidesk: {
        urlBase: string | undefined
        token: string | undefined
        urlCreateTicket: string | undefined
        urlCrudPerson: string | undefined
        urlUploadFile: string | undefined
        urlTicketLink: string | undefined
    }
    relationships: Record<string, Relationship>
}