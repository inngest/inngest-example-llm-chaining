import { Configuration, OpenAIApi } from "openai";
import { inngest } from "./client";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * This is how we define an Inngest function.
 *
 * You define a name for your function and also the event name that will be used
 * to trigger your function. Every time an event with this name is received by Inngest,
 * this function will be invoked.
 *
 * Lastly, we define a function handler which is where our business logic will exist.
 */
export const createMarketingPlan = inngest.createFunction(
  { name: "Create marketing plan" },
  { event: "app/feature.created" },
  async ({ event, step }) => {
    const model = "text-davinci-003";

    /**
     * First, we declare our first "step" which creates our new feature's branding and copy.
     *
     * All code defined within a "step.run" handler is automatically retried.
     * This helps improve the reliability of your function when there are failure's with
     * external systems or resources like OpenAI's API.
     *
     * Any data that you return from the function's handler can be used in later steps.
     */
    const featureBranding = await step.run(
      "Generate feature branding and copywriting",
      async () => {
        const completion = await openai.createCompletion({
          model,
          prompt: `You are a product marketer and copywriter.
          Your job is to create captivating marketing copy and headlines for announcing a new product feature.
          You must brand the feature with a compelling name, create a captivating headline for social media,
          and create a 2-sentence description for why it is so useful.
          You must respond in a JSON object with the following keys: "feature_name", "headline", and "description".

          The feature's technical description is: "${event.data.input}"`,
          max_tokens: 256,
        });

        const resultString = completion.data.choices[0].text;
        if (!resultString) {
          throw new Error("Failed to generate");
        }
        const result = JSON.parse(resultString || "");

        return {
          completionId: completion.data.id,
          result,
        };
      }
    );

    /**
     * Next, we want to expand the new feature's branding into a full blog post announcement.
     *
     * We use the results from our first step's call to OpenAI's API to define our next prompt.
     *
     * As each step is automatically retried independently, if this step fails, the first step
     * will not have to be re-run again. This can make your code faster and also reduce the number
     * of retries which could consume excessive OpenAI tokens.
     */
    const blogPost = await step.run(
      "Draft announcement blog post",
      async () => {
        const completion = await openai.createCompletion({
          model,
          prompt: `You are a content marketer.
          Your job is to create compelling blog posts that announce new software features to developers.
          You must write a blog post that explains why a software developer would use the feature
          and include two different use cases for the new feature.

          The feature's name is: "${featureBranding.result.feature_name}"
          The blog posts's headline is: "${featureBranding.result.headline}"
          The feature's description is: "${featureBranding.result.description}"`,
          max_tokens: 1024,
        });
        return {
          completionId: completion.data.id,
          result: completion.data.choices[0].text,
        };
      }
    );

    // Save the generated content to the database, and return it to be captured
    // as the final function state.
    // await step.run("Save to DB", async () => {
    //   await db.features.create({
    //     input: event.data.input,
    //     name: featureBranding.feature_name,
    //     title: featureBranding.headline,
    //     description: featureBranding.description,
    //     blog_post: blogPost.result,
    //   });
    // });
    return { featureBranding, blogPost };
  }
);
