import { addRoute } from '@server/shared/utils';

export const Get =
    (path: string): MethodDecorator =>
    (target, propertyKey) => {
        addRoute(target.constructor, {
            requestMethod: 'get',
            path,
            methodName: propertyKey,
        });
    };
