import { getRelationships } from "../organizations/relationshipResolver.js"
import { findMovideskPersonByEmail, findMovideskPersonByUserName, createMovideskPerson, updateMovideskPerson } from "./personApi.js"

//ORQUESTRAÇÃO: Busca, cria, vincula org e reativa pessoas
export async function getOrCreatePerson(email, name) {

    console.log(`Buscando pessoa com email: ${email}`)

    const emailData = await findMovideskPersonByEmail(email)
    const userNameData = await findMovideskPersonByUserName(email)

    console.log("Dados retornados da busca email:", JSON.stringify(emailData, null, 2))
    console.log("Dados retornados da busca userName:", JSON.stringify(userNameData, null, 2))

    // Si el correo está en userName y el campo email está vacío, actualizar el registro con el correo en el campo correcto
    if (userNameData.length > 0 && (!emailData || emailData.length === 0)) {
        console.log(" Atualiza campo email com o email capturado no userName...")

        let personId = userNameData[0].id;

        await updateMovideskPerson(personId,
            {
                emails: [
                    {
                        emailType: "Pessoal",
                        email: email,
                        isDefault: true
                    }
                ]
            }
        )

        console.log(" Campo email do usuario atualizado!")
    }

    // Si no existe, lo crea
    if ((!emailData || emailData.length === 0) && (!userNameData || userNameData.length === 0)) {
        console.log(" Usuário não encontrado, criando...")

        const relationships = getRelationships(email)

        const newPersonData =
        {
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

        console.log("Enviando dados para criação:", JSON.stringify(newPersonData, null, 2))

        const newPerson = await createMovideskPerson(newPersonData)

        console.log("Usuário criado com ID:", newPerson.id)
        return newPerson.id
    }

    // Usuário existe, pega info
    const person = emailData[0] || userNameData[0]
    console.log(` Usuário encontrado: ${person.id}, Ativo: ${person.isActive}`)

    if (!person.relationships || person.relationships.length === 0) {
        console.log("Usuário não possui organização... Vinculando organização agora...")

        const relationships = getRelationships(email)

        await updateMovideskPerson(person.id,
            {
                relationships
            }
        )
        // actualiza el objeto en memoria para reflejar el cambio recién guardado en Movidesk
        person.relationships = relationships

        console.log("organização atualizado!")
    }

    // Si está inactivo, lo reactiva.
    if (!person.isActive) {
        console.log(" Reativando usuário...")

        await updateMovideskPerson(person.id,
            {
                isActive: true
            }
        )

        console.log("Usuário reativado!")

    }

    console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)

    return person.id
}