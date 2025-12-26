export const motion = {
    page: {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: 6, transition: { duration: 0.18 } },
    },
    drawer: {
        overlay: {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.18 } },
            exit: { opacity: 0, transition: { duration: 0.16 } },
        },
        panel: {
            initial: { x: 24, opacity: 0 },
            animate: { x: 0, opacity: 1, transition: { duration: 0.22 } },
            exit: { x: 24, opacity: 0, transition: { duration: 0.18 } },
        },
    },
    toast: {
        initial: { opacity: 0, y: 10, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.16 } },
    },
}
