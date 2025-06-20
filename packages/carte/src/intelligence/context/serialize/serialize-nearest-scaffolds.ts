import type { ModelContextCell_NearbyFileScaffolds } from "../type";
import { serializeFileScaffold } from "./serialize-scaffold";
import { findNNearestFiles } from "./utils/n-nearest-files";

export async function serializeNearbyFileScaffolds(cell: ModelContextCell_NearbyFileScaffolds) {
    const { filePath, count } = cell;
    const files = findNNearestFiles(filePath, count);
    const fileContents = await Promise.all(
        files.map(async (file) => serializeFileScaffold({ type: "file-scaffold", filePath: file }))
    );
    return fileContents.join("\n\n");
}
