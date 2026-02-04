import {
    AppController,
    MazeController,
    PlayerController,
} from '@server/router';
import { getAllControllers, matchRoute } from '@server/shared/utils';
import { AugmentedRequest } from '@server/shared/types';

const controllers = [AppController, MazeController, PlayerController];

const instances = new Map<Function, any>();
for (const C of controllers) {
    instances.set(C, new C());
}

const port = Deno.env.get('PORT') || 8000;
const hostname = Deno.env.get('HOSTNAME') ?? '0.0.0.0';
Deno.serve({ port: +port, hostname }, (req) => {
    const { pathname } = new URL(req.url);
    for (const [Ctor, meta] of getAllControllers()) {
        const instance = instances.get(Ctor);
        const base = meta.prefix;

        for (const route of meta.routes) {
            const fullPath = base + route.path;
            const match = matchRoute(fullPath, pathname);

            if (match.matched) {
                const handler = instance[route.methodName].bind(instance);
                const augmentedReq = Object.assign(req, {
                    params: match.params,
                }) as AugmentedRequest;

                return handler(augmentedReq) as Response;
            }
        }
    }

    return new Response('Not found', { status: 404 });
});
