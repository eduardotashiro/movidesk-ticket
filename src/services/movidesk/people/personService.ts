import { getRelationships } from "../organizations/relationshipResolver.js"
import {
    findMovideskPersonByEmail,
    findMovideskPersonByUserName,
    createMovideskPerson,
    updateMovideskPerson
} from "./personApi.js"

import type { MovideskPerson } from "../../../types/movidesk.js"

async function fixMisplacedEmail(personId: number, email: string): Promise<void> {
    await updateMovideskPerson(personId, {
        emails: [
            {
                emailType: "Pessoal",
                email: email,
                isDefault: true
            }
        ]
    })
}

function buildNewPersonPayload(email: string, name: string, relationships: ReturnType<typeof getRelationships>) {
    return {
        isActive: true,
        personType: 1,
        profileType: 2,
        accessProfile: "Partner",
        businessName: name,
        userName: email,
        cultureId: "pt-BR",
        timeZoneId: "America/Sao_Paulo",
        emails: [
            {
                emailType: "Pessoal",
                email: email,
                isDefault: true
            }
        ],
        relationships
    }
}

async function syncOrganization(person: MovideskPerson, email: string): Promise<void> {
    const hasOrganization = (person.relationships?.length ?? 0) > 0
    if (hasOrganization) return

    const relationships = getRelationships(email)
    await updateMovideskPerson(person.id, { relationships })

    person.relationships = relationships
}

async function activatePerson(person: MovideskPerson): Promise<void> {
    if (person.isActive) return

    await updateMovideskPerson(person.id, { isActive: true })
    person.isActive = true
}

// sincroniza la persona en el Movidesk / busca, corrige, crea, vincula organización y reactiva cuando es necesario
export async function syncMovideskPerson(email: string, name: string): Promise<number> {
    const emailMatches = await findMovideskPersonByEmail(email)

    if (emailMatches.length > 0) {
        const person = emailMatches[0]
        await syncOrganization(person, email)
        await activatePerson(person)
        console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)
        return person.id
    }

    const userNameMatches = await findMovideskPersonByUserName(email)

    if (userNameMatches.length > 0) {
        const person = userNameMatches[0]
        await fixMisplacedEmail(person.id, email)
        await syncOrganization(person, email)
        await activatePerson(person)
        console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)
        return person.id
    }

    const relationships = getRelationships(email)
    const newPerson = await createMovideskPerson(buildNewPersonPayload(email, name, relationships))
    console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${newPerson.id}`)
    return newPerson.id
}