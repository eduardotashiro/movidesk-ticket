export const config = {
  port: process.env.PORT,
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    botToken: process.env.SLACK_BOT_TOKEN,
    linkThread: process.env.URL_THREAD_LINK,
    bannerHome: process.env.HOME_BANNER_URL
  },
  dataBase: {
    url: process.env.DATABASE_URL
  },
  movidesk: {
    urlBase: process.env.URL_BASE,
    token: process.env.MOVIDESK_TOKEN,
    urlCreateTicket: process.env.URL_CREATE_TICKET,
    urlCrudPerson: process.env.URL_PERSON,
    urlUploadFile: process.env.URL_UPLOAD_FILE,
    urlTicketLink: process.env.URL_TICKET_LINK
  },
  relationships: {
    angeloni: {
      id: process.env.ANGELONI_ID,
      name: process.env.ANGELONI_NAME
    },
    cardapioweb: {
      id: process.env.CARDAPIOWEB_ID,
      name: process.env.CARDAPIOWEB_NAME
    },
    goomer: {
      id: process.env.GOOMER_ID,
      name: process.env.GOOMER_NAME
    },
    anotaAi: {
      id: process.env.ANOTA_ID,
      name: process.env.ANOTA_NAME,
      slaAgreement: process.env.ANOTA_SLA
    },
    clickbus: {
      id: process.env.CLICKBUS_ID,
      name: process.env.CLICKBUS_NAME
    },
    abinbev: {
      id: process.env.ABINBEV_ID,
      name: process.env.ABINBEV_NAME
    },
    tuna: {
      id: process.env.TUNA_ID,
      name: process.env.TUNA_NAME,
      slaAgreement: process.env.TUNA_SLA
    },
    supernosso: {
      id: process.env.SUPERNOSSO_ID,
      name: process.env.SUPERNOSSO_NAME
    },
    incomm: {
      id: process.env.INCOMMERCE_ID,
      name: process.env.INCOMMERCE_NAME
    },
    gruposc: {
      id: process.env.GRUPOSC_ID,
      name: process.env.GRUPOSC_NAME
    },
    grupoaste: {
      id: process.env.GRUPOASTE_ID,
      name: process.env.GRUPOASTE_NAME
    },
    fastshop: {
      id: process.env.FASTSHOP_ID,
      name: process.env.FASTSHOP_NAME,
      slaAgreement: process.env.FASTSHOP_SLA
    },
    deliverymuch: {
      id: process.env.DELIVERYMUCH_ID,
      name: process.env.DELIVERYMUCH_NAME
    },
    grupoSupernosso: {
      id: process.env.SUPERNOSSO_ID,
      name: process.env.SUPERNOSSO_NAME
    },
    default: {
      id: process.env.DEFAULT_ID,
      name: process.env.DEFAULT_NAME,
      slaAgreement: process.env.DEFAULT_SLA
    }
  }
}
