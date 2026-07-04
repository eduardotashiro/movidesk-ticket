import figlet from "figlet"

export function printBanner(text) {
    figlet(text, function (err, data) {
        if (err) {
            console.log("não gerou ASCII :(")
            return
        }
        console.log(data)
    })
}