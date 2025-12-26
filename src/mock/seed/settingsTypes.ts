export type AppSettings = {
    maintenanceMode: boolean
    features: {
        aiJobs: boolean
        refunds: boolean
        audit: boolean
    }
    controls: {
        supportRefundLimit: number
        maxAiConcurrentRuns: number
    }
}
