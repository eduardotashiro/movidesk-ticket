import figlet from "figlet"

export function printBanner(text: string): void {
    figlet(text, (err, data) => {
        if (err) {
            console.log("não gerou ASCII :(")
            return
        }
        console.log(data)
    })
}