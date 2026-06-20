const ALLOWED_EXTENSIONS = [
    "pdf", "doc", "docx", "xls", "xlsx", "csv",
    "png", "jpg", "jpeg", "txt", "zip"
]

export function isFileAllowed(file) {
    return ALLOWED_EXTENSIONS.includes(file.filetype.toLowerCase())
}