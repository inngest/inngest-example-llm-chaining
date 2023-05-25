# AI/LLM Chaining with Inngest

This project is a demo showing how to use [Inngest](https://www.inngest.com?ref=github-demo-repo-llm-chaining) to chain multiple calls to OpenAI's API within a Next.js application.

The demo concept is a function that accepts a technical description of a new product feature and brands that new feature writing headline and description copy as well as a new feature announcement blog post.

## Why you might need to chain when using LLMs?

To learn why you may need to use chaining with LLMs (Large language models) you should [read our full blog post here](https://www.inngest.com/blog/running-chained-llms-typescript-in-production?ref=github-demo-repo-llm-chaining), but here are some quick highlights:

- Given a user’s input, you might need to run 4 different prompts or ideas and present the output to users as choices (think Midjourney)
- You might need to chunk a user’s input to reduce context/tokens in each call
- You might need to continue to refine input, such as going from question → data → SQL → human readable answer
- You might just want the LLM to introspect whether it made the right answer (eg. ask “Are you sure?”). This is a basic, but common, approach to testing LLM output
- You might ask an LLM whether the prompt is susceptible to injection before running the actual prompt

## Why chain with Inngest?

Inngest allows you to easily and reliable create chains without having to manage state or jobs in between the parts in your chain. Some benefits of using Inngest for chaining are:

- You can define your chain in a single function instead of multiple separate functions or workers
- You can define parts of your chain as Inngest "steps" using `step.run()`
- You can pass state from one step to the next without having to manage the state/context yourself
- Each step is retried automatically, improving reliability

## Getting started

This is a [Next.js](https://nextjs.org/) project, so to get started just run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This command runs two processes concurrently:

- `next dev` - The Next.js app dev server on port `3000`
- `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` - The [Inngest dev server](https://www.inngest.com/docs/local-development?ref=github-demo-repo-llm-chaining) on port `8288`. The `-u` flag points to the Inngest endpoint on the app.

After running the command now you can:

- Open [http://localhost:3000](http://localhost:3000) to see the application
- Open [http://localhost:8288](http://localhost:8288) to view [the Inngest dev server](https://www.inngest.com/docs/local-development?ref=github-demo-repo-llm-chaining)

## Environment variables

To run this project you'll need to set the following keys as environment variables. See [`.env.example`](./.env.example) for more info.

- `INNGEST_EVENT_KEY` - The key used to send events to [Inngest](https://www.inngest.com) (optional in local development) ([How to create and Event Key](https://www.inngest.com/docs/events/creating-an-event-key?ref=github-demo-repo-llm-chaining))
- `INNGEST_SIGNING_KEY` - The key used by the Inngest SDK to securely communicate with your application (context: Inngest invokes your functions via HTTP) ([How to get your signing key](https://www.inngest.com/docs/sdk/serve#signing-key))
- `OPENAI_API_KEY` - An OpenAI [platform API Key](https://platform.openai.com/account/api-keys)

## The code

- [`src/inngest`](src/inngest/) - This is the directory where the Inngest
- [`src/inngest/client.ts`](src/inngest/client.ts) - Defining the Inngest client
- [`src/inngest/functions.ts`](src/inngest/functions.ts) - All Inngest functions that will be run reliably in the background
- [`src/app/api/inngest/route.ts`](src/app/api/inngest/route.ts) - This is the `serve` endpoint so Inngest can remotely and securely invoke your functions

## Deploying the code

You can easily deploy this code to [Vercel](https://vercel.com/) and then register your functions with Inngest using the [Inngest Vercel integration](https://vercel.com/integrations/inngest).
