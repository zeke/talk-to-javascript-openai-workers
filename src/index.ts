import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Replicate from 'replicate';

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

const DEFAULT_INSTRUCTIONS = `You are helpful and have some tools installed.

In the tools you have the ability to control a robot hand.
`;

// Learn more: https://platform.openai.com/docs/api-reference/realtime-sessions/create
app.get('/session', async (c) => {
	const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
		method: "POST",
		headers: {
		  "Authorization": `Bearer ${c.env.OPENAI_API_KEY}`,
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  model: "gpt-4o-realtime-preview-2024-12-17",
		  instructions: DEFAULT_INSTRUCTIONS,
		  voice: "ash",
		}),
	  });
	  const result = await response.json();
	  return c.json({result});
});


app.post('/generate-image', async (c) => {
	const replicate = new Replicate({auth: c.env.REPLICATE_API_TOKEN})
	const model = 'black-forest-labs/flux-schnell'  
	const prompt = await c.req.text()
	const output = await replicate.run(model, {
	  input: {
		prompt,
		image_format: 'webp',
	  }
	})
	  
	// Some image models return an array of output files, others just a single file.
	const imageUrl = Array.isArray(output) ? output[0].url() : output.url()
   
	console.log({imageUrl})

	return c.body(imageUrl, {
		headers: {
			'Content-Type': 'image/webp',
		},
	});
});

export default app;
