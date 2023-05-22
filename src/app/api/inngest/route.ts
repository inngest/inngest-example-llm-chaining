import { serve } from "inngest/next";
import { inngest, functions } from "@/inngest";

export const { GET, POST, PUT } = serve(inngest, functions);
