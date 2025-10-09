
//import { getRelationships } from "../organizations/partners.js"

export async function getOrCreatePerson(email, nome) {
    console.log(` Buscando pessoa com email: ${email}`)
    
    
    const searchUrl = `${process.env.URL_PERSON}?token=${process.env.MOVIDESK_TOKEN}&$filter=emails/any(e: e/email eq '${email}')`


    const response = await fetch(searchUrl)
    console.log(` Status da busca: ${response.status}`)
    

    const data = await response.json()
    console.log(" Dados retornados da busca:", JSON.stringify(data, null, 2))

    // Se não existir, cria
    if (!data || data.length === 0) {
        console.log(" Usuário não encontrado, então cria")
        
        //const relationships = getRelationships(email)

        const newPersonData = {
            isActive: true,
            personType: 1,
            profileType: 2,
            accessProfile: "Partner",
            businessName: nome,
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
            relationships: [
                {
                    id: "1920658474",
                    name: "Não é cliente",
                    slaAgreement: "Contrato NOVO padrão",
                    forceChildrenToHaveSomeAgreement: false,
                    allowAllServices: true,
                    services: [],
                },
            ],
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
    const person = data[0]
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

    console.log(`Retornando ID: ${person.id}`)
    
    return person.id
}