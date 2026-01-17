import { getRelationships } from "../organization/relationships.js"
import config from "../config/env.js"

export async function getOrCreatePerson(email, name) {

    console.log(` Buscando pessoa com email: ${email}`)

    const searchEmailUrl = `${config.movidesk.urlCrudPerson}?token=${config.movidesk.token}&$filter=emails/any(e: e/email eq '${email}')`
    const searchUserName = `${config.movidesk.urlCrudPerson}?token=${config.movidesk.token}&$filter=userName eq '${email}'`
    const responseEmailUrl = await fetch(searchEmailUrl)
    const responseUserNameUrl = await fetch(searchUserName)
    console.log(`Status da busca email: ${responseEmailUrl.status}`)
    console.log(`Status da busca name: ${responseUserNameUrl.status}`)


    const emailData = await responseEmailUrl.json()
    const userNameData = await responseUserNameUrl.json()
    console.log("Dados retornados da busca email:", JSON.stringify(emailData, null, 2))
    console.log("Dados retornados da busca userName:", JSON.stringify(userNameData, null, 2))

    //atualiza campo email
    if (userNameData.length > 0 && (!emailData || emailData.length === 0)) {
        console.log(" Atualiza campo email com o email capturado no userName...")

        let personId = userNameData[0].id;

        const bodyUpdate = {
            emails: [
                {
                    emailType: "Pessoal",
                    email: email,
                    isDefault: true
                }
            ]
        }

        const updateEmailResponse = await fetch(`${config.movidesk.urlBase}/public/v1/persons/?token=${config.movidesk.token}&id=${personId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyUpdate),
            }
        )

        console.log(`Status code da atualização: ${updateEmailResponse.status}`)

        if (!updateEmailResponse.ok) {
            throw new Error("Erro ao atualizar email do usuário no Movidesk")
        } // trata erro...

        console.log(" Campo email do usuario atualizado!")
    }

    // Se não existir, cria
    if ((!emailData || emailData.length === 0) && (!userNameData || userNameData.length === 0)) {
        console.log(" Usuário não encontrado, então cria")

        const relationships = getRelationships(email)

        const newPersonData = {
            isActive: true,
            personType: 1,
            profileType: 2,
            accessProfile: "Partner",
            businessName: name,
            userName: email, //1º buscar
            cultureId: "pt-BR",
            timeZoneId: "America/Sao_Paulo",
            emails: [
                {
                    emailType: "Pessoal",
                    email: email, //2º buscar
                    isDefault: true
                }
            ],
            relationships
        }

        console.log("Enviando dados para criação:", JSON.stringify(newPersonData, null, 2))

        try {
            const newPersonResponse = await fetch( `${config.movidesk.urlBase}/public/v1/persons?token=${config.movidesk.token}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPersonData),
                }
            )

            console.log(`Status code da criação: ${newPersonResponse.status}`)

            if (!newPersonResponse.ok) {
                const errorText = await newPersonResponse.text()
                console.error(" Erro detalhado API Movidesk:", errorText)
                console.error(" Status code:", newPersonResponse.status)
                throw new Error(`Erro ao criar usuário: ${newPersonResponse.status} - ${errorText}`)
            }

            const newPerson = await newPersonResponse.json()
            console.log("Usuário criado com ID:", newPerson.id)
            console.log("Usuário criado com ID completo:", JSON.stringify(newPerson))
            return newPerson.id

        } catch (error) {
            console.error("ERRO NA REQUISIÇÃO:", error.message)
            throw error
        }
    }

    // Usuário existe, pega info
    const person = emailData[0] || userNameData[0]
    console.log(` Usuário encontrado: ${person.id}, Ativo: ${person.isActive}`)

    if (!person.relationships || person.relationships.length === 0) {
        console.log("Usuário não possui organização... Vinculando organização agora...")

        const relationships = getRelationships(email)

        const bodyUpdate = {
            relationships
        }

        const updateRelationshipResponse = await fetch(`${config.movidesk.urlBase}/public/v1/persons/?token=${config.movidesk.token}&id=${person.id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyUpdate),
            }
        )

        console.log(`Status code da atualização de organização: ${updateRelationshipResponse.status}`)

        if (!updateRelationshipResponse.ok) {
            throw new Error("Erro ao atualizar organização do usuário no Movidesk")
        }

        person.relationships = relationships

        console.log("organização atualizado!")
    }

    // Reativa se estiver inativo / fazer feat quando chegar em casa- tratar quando usuário não tem organização vinculada e vincular de acordo com o dominio 
    if (!person.isActive) {
        console.log(" Reativa usuário...")

        const activateResponse = await fetch(`${config.movidesk.urlBase}/public/v1/persons/?token=${config.movidesk.token}&id=${person.id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true }),
            }
        )

        console.log(`Status code da reativação: ${activateResponse.status}`)

        if (!activateResponse.ok) {
            throw new Error("Erro ao reativar usuário no Movidesk")
        }

        console.log(" Usuário reativado!")
    }

    console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)

    return person.id
}