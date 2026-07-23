import { config } from "../../../config/env.js"
import type { MovideskPerson } from "../../../types/movidesk.js"

const TOKEN = config.movidesk.token
const URL_CRUD_PERSON = config.movidesk.urlCrudPerson

export async function findMovideskPersonByEmail(email: string): Promise<MovideskPerson[]> {
    const url = `${URL_CRUD_PERSON}${TOKEN}&$filter=emails/any(e: e/email eq '${email}')`
    const response = await fetch(url)
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao buscar pessoa por email: ${response.status}:${text}`)
        throw new Error(`Erro ao buscar pessoa por email: ${response.status}`)
    }
    return await response.json()
}

export async function findMovideskPersonByUserName(email: string): Promise<MovideskPerson[]> {
    const url = `${URL_CRUD_PERSON}${TOKEN}&$filter=userName eq '${email}'`
    const response = await fetch(url)
    if (!response.ok) {
        const text = await response.text()
        console.error(`Erro ao buscar pessoa por nome de usuário: ${response.status}:${text}`)
        throw new Error(`Erro ao buscar pessoa por nome de usuário: ${response.status}`)
    }
    return await response.json()
}

export async function createMovideskPerson(personData: Record<string, unknown>): Promise<MovideskPerson> {
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
    return await response.json()
}

export async function updateMovideskPerson(personId: number, updateData: Record<string, unknown>): Promise<MovideskPerson> {
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
    return await response.json()
}