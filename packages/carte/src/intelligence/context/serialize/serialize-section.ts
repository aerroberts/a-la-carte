import type { ModelContextCell_Section } from "../type";

export function serializeSection(cell: ModelContextCell_Section) {
    const { title, description } = cell;
    return `# ${title} \n\n${description}`;
}
