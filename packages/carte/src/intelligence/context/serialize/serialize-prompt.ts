import { Storage } from "../../..";

export async function serializePrompt(prompt: string) {
    return await Storage.loadPrompt(prompt);
}
