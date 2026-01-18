import {config} from "../config/env.js"

export function getRelationships(email) {

  const domain = email.split("@")[1].toLowerCase()

  let relationship

  switch (domain) {
    case "angeloni.com.br":
      relationship = {
        id:config.relationships.angeloni.id,
        name: config.relationships.angeloni.name,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "cardapioweb.com":
      relationship = {
        id: config.relationships.cardapioweb.id,
        name: config.relationships.cardapioweb.name,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "goomer.com.br":
      relationship = {
        id: config.relationships.goomer.id,
        name: config.relationships.goomer.name,
        slaAgreement: null,
        allowAllServices: true,
      }
      break

    case "anota.ai":   
      relationship = {
        id: config.relationships.anotaAi.id,
        name: config.relationships.anotaAi.name,
        slaAgreement: config.relationships.anotaAi.slaAgreement,
        allowAllServices: true,
      }
      break

    case "clickbus.com":
      relationship = {
        id: config.relationships.clickbus.id,
        name: config.relationships.clickbus.name,
        allowAllServices: true,
      }
      break

    case "ab-inbev.com":
      relationship = {
        id: config.relationships.abinbev.id,
        name: config.relationships.abinbev.name,
        allowAllServices: true,
      }
      break

    case "incomm.com":
      relationship = {
        id: config.relationships.incomm.id,
        name: config.relationships.incomm.name,
        allowAllServices: true,
      }
      break

    case "grupoaste.com.br":
      relationship = {
        id: config.relationships.grupoaste.id,
        name: config.relationships.grupoaste.name,
        allowAllServices: true,
      }
      break

    case "supernosso.com.br":
      relationship = {
        id: config.relationships.supernosso.id,
        name: config.relationships.supernosso.name,
        allowAllServices: true,
      }
      break

    case "deliverymuch.com.br":
      relationship = {
        id: config.relationships.deliverymuch.id,
        name: config.relationships.deliverymuch.name,
        allowAllServices: true,
      }
      break

    case "gruposc.com.br":
      relationship = {
        id: config.relationships.gruposc.id,
        name: config.relationships.gruposc.name,
        allowAllServices: true,
      }
      break

    case "fastshop.com.br":
      relationship = {
        id: config.relationships.fastshop.id,
        name: config.relationships.fastshop.name,
        slaAgreement: config.relationships.fastshop.slaAgreement,
        allowAllServices: true,
      }
      break

      case "tuna.uy":
      relationship = {
        id: config.relationships.tuna.id,
        name: config.relationships.tuna.name,
        slaAgreement: config.relationships.tuna.slaAgreement,
        allowAllServices: true,
      }
      break

    default:
      relationship = {
        id: config.relationships.default.id,
        name: config.relationships.default.name,
        slaAgreement: config.relationships.default.slaAgreement,
        forceChildrenToHaveSomeAgreement: false,
        allowAllServices: true

      }
      break
  }

  return [relationship]

}
