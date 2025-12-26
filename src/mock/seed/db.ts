import { generateSeed, type SeedDb } from "./generate"

let db: SeedDb = generateSeed()

export function getDb() {
    return db
}

export function resetDb() {
    db = generateSeed()
    return db
}
