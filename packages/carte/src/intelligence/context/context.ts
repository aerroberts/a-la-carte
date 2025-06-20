import { serializeFileTree } from "./serialize/serialize-file-tree";
import { serializeFullFile } from "./serialize/serialize-full-file";
import { serializeNearbyFullFiles } from "./serialize/serialize-nearest-files";
import { serializeNearbyFileScaffolds } from "./serialize/serialize-nearest-scaffolds";
import { serializePrompt } from "./serialize/serialize-prompt";
import { serializeFileScaffold } from "./serialize/serialize-scaffold";
import { serializeSection } from "./serialize/serialize-section";
import type { ModelContextCell } from "./type";

export class ModelContext {
    private context: ModelContextCell[] = [];

    private addCell(cell: ModelContextCell) {
        this.context.push(cell);
    }

    addFileTree(rootPath: string) {
        this.addCell({
            title: "File Tree",
            body: { type: "file-tree", rootDirPath: rootPath },
        });
        return this;
    }

    addFullFile(title: string, filePath: string) {
        this.addCell({
            title,
            body: { type: "file-content", filePath },
        });
        return this;
    }

    addNearbyFullFiles(title: string, filePath: string, count: number) {
        this.addCell({
            title,
            body: { type: "nearby-full-files", filePath, count },
        });
        return this;
    }

    addFileScaffold(title: string, filePath: string) {
        this.addCell({
            title,
            body: { type: "file-scaffold", filePath },
        });
        return this;
    }

    addNearbyFileScaffolds(title: string, filePath: string, count: number) {
        this.addCell({
            title,
            body: { type: "nearby-file-scaffolds", filePath, count },
        });
        return this;
    }

    addUserRequest(request: string) {
        this.addCell({
            title: "User Request",
            body: { type: "user-request", request },
        });
        return this;
    }

    addIncludedPrompts(promptNames: string[]) {
        for (const promptName of promptNames) {
            this.addCell({
                title: "Included Prompt",
                body: { type: "included-prompt", promptName },
            });
        }
        return this;
    }

    addCommandOutput(command: string, commandPath: string) {
        this.addCell({
            title: "Command Output",
            body: { type: "command-output", command, commandPath },
        });
        return this;
    }

    addSection(title: string, description: string) {
        this.addCell({
            title,
            body: { type: "section", title, description },
        });
        return this;
    }

    async compile() {
        const joinedContext: string[] = [];
        for (const cell of this.context) {
            if (cell.body.type === "file-tree") {
                joinedContext.push(serializeFileTree(cell.body));
            }
            if (cell.body.type === "section") {
                joinedContext.push(serializeSection(cell.body));
            }
            if (cell.body.type === "file-content") {
                joinedContext.push(await serializeFullFile(cell.body));
            }
            if (cell.body.type === "file-scaffold") {
                joinedContext.push(await serializeFileScaffold(cell.body));
            }
            if (cell.body.type === "nearby-full-files") {
                joinedContext.push(await serializeNearbyFullFiles(cell.body));
            }
            if (cell.body.type === "nearby-file-scaffolds") {
                joinedContext.push(await serializeNearbyFileScaffolds(cell.body));
            }
            if (cell.body.type === "included-prompt") {
                joinedContext.push(await serializePrompt(cell.body.promptName));
            }
        }
        return joinedContext.join("\n\n");
    }
}
