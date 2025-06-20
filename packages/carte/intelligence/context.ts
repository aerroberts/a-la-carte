import { existsSync, readFileSync } from "node:fs";
import { Log } from "../utils/logger";
import { loadPrompt } from "../utils/prompts";
import { Config } from "../utils/state";

export class ModelContext {
    private context: string[] = [];

    public addContextSection(title: string, key: string, value: string) {
        this.context.push(`# ${title}\n\n<${key}>\n${value}\n</${key}>`);
        return this;
    }

    public addPrompts(promptNames: string[]) {
        for (const promptName of promptNames) {
            this.addPrompt(promptName);
        }
        return this;
    }

    public addPrompt(promptName: string) {
        this.addContextSection(promptName, "prompt", loadPrompt(promptName));
        return this;
    }

    public addUserRequest(userRequest: string) {
        if (!userRequest) {
            return this;
        }

        this.addContextSection("user-request", "user-request", userRequest);
        return this;
    }

    public addRequestFromFile(filePath: string) {
        if (!existsSync(filePath)) {
            Log.warning(`File ${filePath} does not exist, including a blank file`);
            this.context.push(
                `# User Request (${filePath}) \n\nPlease now use the following as the user provided input:\n<user-request>\nTHIS FILE IS EMPTY CURRENTLY: ${filePath}\n</user-request>`
            );
            return this;
        }
        const fileContent = readFileSync(filePath, "utf-8");
        this.context.push(
            `# User Request (${filePath}) \n\nPlease now use the following as the user provided input:\n<user-request>\n${fileContent}\n</user-request>`
        );
        return this;
    }

    public addContextForFile(filePath: string, command: string, context: string) {
        this.context.push(
            `# Additional Context for \`${filePath}\`\n\nI also ran the following command to get additional context for the file:\n<command>${command}</command>\n\n<result>${context}</result>`
        );
        return this;
    }

    public toString() {
        return this.context.join("\n\n");
    }

    public toFile() {
        return Config.writeToTmp(this.toString(), ".md");
    }
}
