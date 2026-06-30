//Requisições HTTP puras (GET, POST, PATCH) para o Movidesk

import { config } from "../../../config/env.js"

const TOKEN = config.movidesk.token
const URL_CRUD_PERSON = config.movidesk.urlCrudPerson

export async function findMovideskPersonByEmail(email) {
    const url = `${URL_CRUD_PERSON}${TOKEN}&$filter=emails/any(e: e/email eq '${email}')`
    const response = await fetch(url)
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao buscar pessoa por email: ${response.status}:${text}`)
        throw new Error(`Erro ao buscar pessoa por email: ${response.status}`)
    }
    const result = await response.json()
    return result
}

export async function findMovideskPersonByUserName(email) {
    const url = `${URL_CRUD_PERSON}${TOKEN}&$filter=userName eq '${email}'`
    const response = await fetch(url)
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao buscar pessoa por nome de usuário: ${response.status}:${text}`)
        throw new Error(`Erro ao buscar pessoa por nome de usuário: ${response.status}`)
    }
    const result = await response.json()
    return result
}

export async function createMovideskPerson(personData) {
    const url = `${URL_CRUD_PERSON}${TOKEN}`
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personData)
    })
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao criar pessoa: ${response.status}:${text}`)
        throw new Error(`Erro ao criar pessoa: ${response.status}`)
    }
    const result = await response.json()
    return result
}

export async function updateMovideskPerson(personId, updateData) {
    const url = `${URL_CRUD_PERSON}${TOKEN}&id=${personId}`
    const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
    })
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao atualizar pessoa: ${response.status}:${text}`)
        throw new Error(`Erro ao atualizar pessoa: ${response.status}`)
    }
    const result = await response.json()
    return result
}