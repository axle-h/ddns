export interface Router {
    status(): Promise<RouterStatus>
}

export interface RouterStatus {
    wanAddress: string
}