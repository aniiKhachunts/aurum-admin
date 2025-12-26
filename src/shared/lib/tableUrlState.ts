import type {SortingState} from "@tanstack/react-table";

export type SortState = { id: string; desc: boolean }[]

export function parseIntParam(v: string | null, fallback: number) {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

export function parseSortParam(v?: string | null): SortingState {
    if (!v) return []
    return v.split(",").map((p) => {
        const [id, dir] = p.split(":")
        return { id, desc: dir === "desc" }
    })
}

export function serializeSortParam(s?: SortingState) {
    if (!Array.isArray(s) || s.length === 0) return undefined
    return s.map((x) => `${x.id}:${x.desc ? "desc" : "asc"}`).join(",")
}

export function getParam(params: URLSearchParams, key: string) {
    const v = (params.get(key) || "").trim()
    return v || ""
}

export function setOrDelete(sp: URLSearchParams, key: string, value?: string | null) {
    if (value == null || value === "") sp.delete(key)
    else sp.set(key, value)
}
