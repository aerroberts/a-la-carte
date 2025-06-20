import type { ModelContextCell_NearbyFullFiles } from "../type";
import { serializeFullFile } from "./serialize-full-file";
import { findNNearestFiles } from "./utils/n-nearest-files";

export async function serializeNearbyFullFiles(cell: ModelContextCell_NearbyFullFiles) {
    const { filePath, count } = cell;
    const files = findNNearestFiles(filePath, count);
    const fileContents = await Promise.all(
        files.map(async (file) => serializeFullFile({ type: "file-content", filePath: file }))
    );
    return fileContents.join("\n\n");
}
