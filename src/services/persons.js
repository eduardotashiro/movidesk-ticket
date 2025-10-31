import { getRelationships } from "../organization/relationships.js"

export async function getOrCreatePerson(email, name) {


    console.log(` Buscando pessoa com email: ${email}`)
    

    const searchEmailUrl = `${process.env.URL_PERSON}?token=${process.env.MOVIDESK_TOKEN}&$filter=emails/any(e: e/email eq '${email}')`
    const searchUserName = `${process.env.URL_PERSON}?token=${process.env.MOVIDESK_TOKEN}&$filter=userName eq '${email}'`

    const responseEmailUrl = await fetch(searchEmailUrl)
    const responseUserNameUrl = await fetch(searchUserName)
    
    console.log(` Status da busca email: ${responseEmailUrl.status}`)
    console.log(` Status da busca name: ${responseUserNameUrl.status}`)
    

    const emailData = await responseEmailUrl.json()
    const userNameData = await responseUserNameUrl.json()
    console.log(" Dados retornados da busca email:", JSON.stringify(emailData, null, 2))
    console.log(" Dados retornados da busca userName:", JSON.stringify(userNameData, null, 2))

    // Se não existir, cria
    if ((!emailData || emailData.length=== 0) && (!userNameData || userNameData.length === 0)) {//ordem de precedencia
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


        console.log(" Enviando dados para criação:", JSON.stringify(newPersonData, null, 2))
        

        try {
            const newPersonResponse = await fetch(
                `${process.env.MOVIDESK_API}/public/v1/persons?token=${process.env.MOVIDESK_TOKEN}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPersonData),
                }
            )


            console.log(` Status da criação: ${newPersonResponse.status}`)
            

            if (!newPersonResponse.ok) {
                const errorText = await newPersonResponse.text()
                console.error(" Erro detalhado API Movidesk:", errorText)
                console.error(" Status:", newPersonResponse.status)
                throw new Error(`Erro ao criar usuário: ${newPersonResponse.status} - ${errorText}`)
            }


            const newPerson = await newPersonResponse.json()
            console.log(" Usuário criado com ID:", newPerson.id)
            console.log(" Usuário criado com ID completo:", JSON.stringify(newPerson))
            return newPerson.id
            

        } catch (error) {
            console.error(" ERRO NA REQUISIÇÃO:", error.message)
            throw error
        }
    }

    // Usuário existe, pega info
    const person = emailData[0] || userNameData[0]
    console.log(` Usuário encontrado: ${person.id}, Ativo: ${person.isActive}`)
    

    // Reativa se estiver inativo
    if (!person.isActive) {
        console.log(" Reativa usuário...")
        
        const activateResponse = await fetch(
            `${process.env.MOVIDESK_API}/public/v1/persons/?token=${process.env.MOVIDESK_TOKEN}&id=${person.id}`,
            {
                method: "PATCH", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true }),
            }
        )
        
        console.log(`Status da reativação: ${activateResponse.status}`)
        
        if (!activateResponse.ok) {
            throw new Error("Erro ao reativar usuário no Movidesk")
        }
        
        console.log(" Usuário reativado!")
    }

    console.log(`Movidesk - Pessoa vinculada: ${email} ID: ${person.id}`)

    return person.id
}