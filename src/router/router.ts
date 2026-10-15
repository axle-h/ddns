export interface Router {
    status(): Promise<RouterStatus>
    logout(): Promise<void>
}

export interface RouterStatus {
    wanAddress: string
}