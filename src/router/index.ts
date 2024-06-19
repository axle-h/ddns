import {TpLinkRouter} from "./tp-link";
import {Router} from "./router";

export enum RouterType {
    TpLink = 1
}

export interface RouterConfig {
    type: RouterType
    host: string
    password: string
}

export async function buildRouter(config: RouterConfig): Promise<Router> {
    switch (config.type) {
        case RouterType.TpLink:
            return TpLinkRouter.build(config.host, config.password)
    }
}