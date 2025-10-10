import dotenv from "dotenv"
dotenv.config()

export function getRelationships(email) {

  const domain = email.split("@")[1].toLowerCase()

  let relationship

  switch (domain) {
    case "angeloni.com.br":
      relationship = {
        id: process.env.ANGELONI_ID,
        name: process.env.ANGELONI_NAME,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "cardapioweb.com":
      relationship = {
        id: process.env.CARDAPIOWEB_ID,
        name: process.env.CARDAPIOWEB_NAME,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "goomer.com.br":
      relationship = {
        id: process.env.GOOMER_ID,
        name: process.env.GOOMER_NAME,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "anota.ai":   
      relationship = {
        id: process.env.ANOTA_ID,
        name: process.env.ANOTA_NAME,
        slaAgreement: process.env.ANOTA_SLA,
        allowAllServices: true,
      }
      break

    case "clickbus.com":
      relationship = {
        id:process.env.CLICKBUS_ID,
        name:process.env.CLICKBUS_NAME,
        allowAllServices: true,
      }
      break

    case "ab-inbev.com":
      relationship = {
        id: process.env.ABINBEV_ID,
        name:process.env.ABINBEV_NAME,
        allowAllServices: true,
      }
      break

    case "incomm.com":
      relationship = {
        id: process.env.INCOMM_ID,
        name: process.env.INCOMM_NAME,
        allowAllServices: true,
      }
      break

    case "grupoaste.com.br":
      relationship = {
        id: process.env.GRUPOASTE_ID,
        name: process.env.GRUPOASTE_NAME,
        allowAllServices: true,
      }
      break

    case "supernosso.com.br":
      relationship = {
        id: process.env.SUPERNOSSO_ID,
        name: process.env.SUPERNOSSO_NAME,
        allowAllServices: true,
      }
      break

    case "deliverymuch.com.br":
      relationship = {
        id: process.env.DELIVERYMUCH_ID,
        name: process.env.DELIVERYMUCH_NAME,
        allowAllServices: true,
      }
      break

    case "gruposc.com.br":
      relationship = {
        id: process.env.GRUPOSC_ID,
        name: process.env.GRUPOSC_NAME,
        allowAllServices: true,
      }
      break

    case "fastshop.com.br":
      relationship = {
        id: process.env.FASTSHOP_ID,
        name: process.env.FASTSHOP_NAME,
        slaAgreement: process.env.FASTSHOP_SLA,
        allowAllServices: true,
      }
      break

    default:
      relationship = {
        id: process.env.DEFAULT_ID,
        name: process.env.DEFAULT_NAME,
        slaAgreement: process.env.DEFAULT_SLA,
        forceChildrenToHaveSomeAgreement: false,
        allowAllServices: true

      }
      break
  }

  return [relationship]

}
