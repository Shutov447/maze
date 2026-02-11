export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'options';

export interface RouteDefinition {
    path: string;
    requestMethod: HttpMethod;
    methodName: string | symbol;
}

export interface ControllerMeta {
    prefix: string;
    routes: RouteDefinition[];
}

const controllers = new Map<Function, ControllerMeta>();

export const setControllerPrefix = (target: Function, prefix: string): void => {
    const existing = controllers.get(target) ?? { prefix: '', routes: [] };
    existing.prefix = prefix;
};

export const addRoute = (target: Function, def: RouteDefinition): void => {
    const existing = controllers.get(target) ?? { prefix: '', routes: [] };
    existing.routes.push(def);
    controllers.set(target, existing);
};

export const getControllerMeta = (
    target: Function,
): ControllerMeta | undefined => {
    return controllers.get(target);
};

export const getAllControllers = (): [Function, ControllerMeta][] => {
    return Array.from(controllers.entries());
};
