import { getRelationships } from "../organizations/relationshipResolver.js"
import { findMovideskPersonByEmail, findMovideskPersonByUserName, createMovideskPerson, updateMovideskPerson } from "./personApi.js"



// Si el correo está en userName y el campo email está vacío, actualizar el registro con el correo en el campo correcto
async function fixMisplacedEmail(personId, email) {
    await updateMovideskPerson(personId,
        {
            emails: 
            [
                {
                    emailType: "Pessoal",
                    email: email,
                    isDefault: true
                }
            ]
        }
    )
}




function buildNewPersonPayload(email, name, relationships) {
    return {
        isActive: true,
        personType: 1,
        profileType: 2,
        accessProfile: "Partner",
        businessName: name,
        userName: email,
        cultureId: "pt-BR",
        timeZoneId: "America/Sao_Paulo",
        emails:
            [
                {
                    emailType: "Pessoal",
                    email: email,
                    isDefault: true
                }
            ],
        relationships
    }
}



async function syncOrganization(person, email) {
    const hasOrganization = person.relationships?.length > 0
    if (hasOrganization) return

    const relationships = getRelationships(email)
    await updateMovideskPerson(person.id, 
        { 
            relationships
        }
    )

    person.relationships = relationships
}



async function activatePerson(person) {
    const isActive = person.isActive
    if (isActive) return

    await updateMovideskPerson(person.id, 
        { 
            isActive: true 
        }
    )
    person.isActive = true
}


// sincroniza la persona en el Movidesk / busca, corrige, crea, vincula organización y reactiva cuando es necesario
export async function syncMovideskPerson(email, name) {
    const emailMatches = await findMovideskPersonByEmail(email)

    if (emailMatches?.length > 0) {
        const person = emailMatches[0]
        await syncOrganization(person, email)
        await activatePerson(person)
        console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)
        return person.id
    }

    //si,muchos campos UserName están mal, pero es lo que tenemos para buscar personas que no tienen email registrado en movidesk weon
    const userNameMatches = await findMovideskPersonByUserName(email)

    if (userNameMatches?.length > 0) {
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