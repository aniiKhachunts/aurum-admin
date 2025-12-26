import { useToastStore } from "./toastStore"

export const toast = {
    success: (title: string, message?: string) => useToastStore.getState().push({ kind: "success", title, message }),
    error: (title: string, message?: string) => useToastStore.getState().push({ kind: "error", title, message }),
    info: (title: string, message?: string) => useToastStore.getState().push({ kind: "info", title, message }),
    clear: () => useToastStore.getState().clear(),
}
