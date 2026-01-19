Deno.serve({ port: 8000, hostname: '0.0.0.0' }, (req) => {
    const rootDir = '../';
    const url = req.url.replace('http://localhost:8000/', rootDir);

    if (req.url === 'http://localhost:8000/') {
        const body = Deno.readTextFileSync(rootDir + 'index.html');

        return new Response(body, {
            headers: {
                'content-type': 'text/html; charset=utf-8',
            },
        });
    }
    if (url.includes('.js')) {
        const body = Deno.readTextFileSync(url);

        return new Response(body, {
            headers: {
                'content-type': 'text/javascript',
            },
        });
    }
    if (url.includes('.css')) {
        const body = Deno.readTextFileSync(url);

        return new Response(body, {
            headers: {
                'content-type': 'text/css',
            },
        });
    }

    return new Response('not found', {
        status: 404,
    });
});
