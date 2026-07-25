import { isFileAllowed, isFileSizeAllowed } from "./fileValidator.js"
import { FileValidationReason } from "../../types/attachment.js"
import type { SlackFile } from "../../types/slack.js"

export interface ProcessFilesResult {
    allowedFiles: SlackFile[]
    rejectedFiles: SlackFile[]
    rejectedDetails: string
}

export function processFiles(files: SlackFile[]): ProcessFilesResult {
    const allowedFiles = files.filter((f) => isFileAllowed(f) && isFileSizeAllowed(f))
    const rejectedFiles = files.filter((f) => !isFileAllowed(f) || !isFileSizeAllowed(f))

    const rejectedDetails = rejectedFiles.map((f) => {
        const reasons: string[] = []
        if (!isFileAllowed(f)) reasons.push(FileValidationReason.INVALID_EXTENSION)
        if (!isFileSizeAllowed(f)) reasons.push(FileValidationReason.MAX_SIZE)
        return `• ${f.name} (${reasons.join(" e ")})`
    }).join("\n")

    return {
        allowedFiles,
        rejectedFiles,
        rejectedDetails
    }
}