const ALLOWED_EXTENSIONS = [
    "pdf", "doc", "docx", "xls", "xlsx", "csv",
    "png", "jpg", "jpeg", "txt", "zip","mp4"
]

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB


export function isFileAllowed(file) {
    return ALLOWED_EXTENSIONS.includes(file.filetype.toLowerCase())
}

export function isFileSizeAllowed(file) {
    return file.size <= MAX_FILE_SIZE_BYTES
}