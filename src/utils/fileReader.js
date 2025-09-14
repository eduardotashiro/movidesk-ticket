import {readFileSync} from 'fs'

export function readEmail(filepath) {

    const data = readFileSync(filepath, "utf-8")
    return JSON.parse(data)
}