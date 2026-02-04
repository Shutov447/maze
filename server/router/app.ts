import { Controller, Get } from '@server/router/decorators';

@Controller('')
export class AppController {
    @Get('/')
    getHtml(): Response {
        const body = Deno.readTextFileSync('./index.html');
        return new Response(body, {
            headers: {
                'content-type': 'text/html',
            },
        });
    }

    @Get('/style.css') getCss() {
        const body = Deno.readTextFileSync('./style.css');
        return new Response(body, {
            headers: {
                'content-type': 'text/css',
            },
        });
    }

    @Get('/build/client/main.js') getJs() {
        const body = Deno.readTextFileSync('./build/client/main.js');
        return new Response(body, {
            headers: {
                'content-type': 'text/javascript',
            },
        });
    }
}
