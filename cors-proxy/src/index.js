import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
	'*',
	cors({
		origin: '*',
		allowHeaders: '*',
		allowMethods: ['GET', 'OPTIONS'],
		maxAge: 600,
	})
);

app.all('*', async (c) => {
	const targetUrl = c.req.query('url');
	if (!targetUrl) {
		return c.text('Missing target URL', 400);
	}

	const url = new URL(targetUrl);
	const targetRequest = new Request(url, {
		method: c.req.method,
		headers: c.req.raw.headers,
		body: ['GET', 'HEAD'].includes(c.req.method) ? null : c.req.raw.body,
	});

	const response = await fetch(targetRequest);

	const newHeaders = new Headers(response.headers);
	newHeaders.set('Access-Control-Allow-Origin', '*');
	newHeaders.set('Access-Control-Allow-Methods', '*');
	newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

	return new Response(response.body, {
		status: response.status,
		headers: newHeaders,
	});
});

export default app;
