import { isFileAllowed, isFileSizeAllowed } from "./fileValidator.js"

export function processFiles(files) {
    const allowedFiles = files.filter((f) => isFileAllowed(f) && isFileSizeAllowed(f))
    const rejectedFiles = files.filter((f) => !isFileAllowed(f) || !isFileSizeAllowed(f))

    const rejectedDetails = rejectedFiles.map((f) => {
        const reasons = []
        if (!isFileAllowed(f)) reasons.push("extensão não permitida")
        if (!isFileSizeAllowed(f)) reasons.push("acima de 20MB")
        return `${f.name} (${reasons.join(" e ")})`
    }).join("\n")

    return {
        allowedFiles,
        rejectedFiles,
        rejectedDetails
    }
}