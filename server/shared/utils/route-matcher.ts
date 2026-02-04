export interface RouteMatch {
    matched: boolean;
    params: Record<string, string>;
}

export function matchRoute(route: string, pathname: string): RouteMatch {
    const routeSegments = route.split('/').filter(Boolean);
    const pathSegments = pathname.split('/').filter(Boolean);

    if (routeSegments.length !== pathSegments.length) {
        return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeSegments.length; i++) {
        const routeSeg = routeSegments[i];
        const pathSeg = pathSegments[i];

        if (routeSeg.startsWith(':')) {
            const paramName = routeSeg.slice(1);
            params[paramName] = pathSeg;
        } else if (routeSeg !== pathSeg) {
            return { matched: false, params: {} };
        }
    }

    return { matched: true, params };
}
