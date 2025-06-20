import { bash } from "../../../utils/bash/bash";
import type { ModelContextCell_CommandFiles } from "../type";
import { findNNearestFiles } from "./utils/n-nearest-files";

export async function serializeFileCommand(cell: ModelContextCell_CommandFiles) {
    const { filePath, command, count } = cell;
    const files = findNNearestFiles(filePath, count);
    const fileContents = await Promise.all(
        files.map(async (file) => {
            const commandOutput = await bash(`export FILE_PATH=${file} && ${command}`);
            return `## Ran Command to build context\nThe bash command \`${command}\` was run against file ${file}.\nThis should help you understand the file better. \n\`\`\`\n${commandOutput}\n\`\`\``;
        })
    );
    return fileContents.join("\n\n");
}
