import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getParam, parseIntParam, parseSortParam, serializeSortParam, setOrDelete } from "../lib/tableUrlState"
import type { SortingState } from "@tanstack/react-table"

type Config = {
    pageKey?: string
    pageSizeKey?: string
    searchKey?: string
    sortKey?: string
    defaults?: {
        page?: number
        pageSize?: number
        search?: string
        sort?: SortingState
    }
}

type Frozen = {
    pageKey: string
    pageSizeKey: string
    searchKey: string
    sortKey: string
    defaults: {
        page: number
        pageSize: number
        search: string
        sort: SortingState
    }
}

export function useTableQueryState(config: Config = {}) {
    const [frozen] = useState<Frozen>(() => ({
        pageKey: config.pageKey ?? "page",
        pageSizeKey: config.pageSizeKey ?? "pageSize",
        searchKey: config.searchKey ?? "search",
        sortKey: config.sortKey ?? "sort",
        defaults: {
            page: config.defaults?.page ?? 1,
            pageSize: config.defaults?.pageSize ?? 20,
            search: config.defaults?.search ?? "",
            sort: config.defaults?.sort ?? [],
        },
    }))

    const [sp, setSp] = useSearchParams()
    const spKey = sp.toString()
    const lastWrite = useRef("")

    const state = useMemo(() => {
        const page = parseIntParam(sp.get(frozen.pageKey), frozen.defaults.page)
        const pageSize = parseIntParam(sp.get(frozen.pageSizeKey), frozen.defaults.pageSize)
        const search = (getParam(sp, frozen.searchKey) || frozen.defaults.search || "").trim()

        const parsedSort = parseSortParam(sp.get(frozen.sortKey)) as SortingState
        const sort = parsedSort.length ? parsedSort : frozen.defaults.sort

        return { page, pageSize, search, sort }
    }, [spKey, frozen])

    function write(patch: Partial<typeof state>) {
        const next = new URLSearchParams(sp)

        const nextPage = patch.page ?? state.page
        const nextPageSize = patch.pageSize ?? state.pageSize
        const nextSearch = (patch.search ?? state.search).trim()
        const nextSort = patch.sort ?? state.sort

        setOrDelete(next, frozen.pageKey, String(nextPage))
        setOrDelete(next, frozen.pageSizeKey, String(nextPageSize))
        setOrDelete(next, frozen.searchKey, nextSearch)

        const sortSerialized = nextSort.length ? serializeSortParam(nextSort) : ""
        setOrDelete(next, frozen.sortKey, sortSerialized)

        const asString = next.toString()
        if (asString === lastWrite.current) return
        if (asString === spKey) return

        lastWrite.current = asString
        setSp(next, { replace: true })
    }

    useEffect(() => {
        lastWrite.current = spKey
    }, [spKey])

    return { state, write }
}
