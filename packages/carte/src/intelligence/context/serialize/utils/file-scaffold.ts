import { readFileSync } from "node:fs";
import Parser, { type SyntaxNode } from "tree-sitter";
import TypeScript from "tree-sitter-typescript";
import { Log } from "../../../../utils/logger";

const TypeScriptParser = new Parser();
TypeScriptParser.setLanguage(TypeScript.typescript);

export function generateFileScaffold(filePath: string): string | null {
    const fileContent = readFileSync(filePath, "utf-8");
    const fileTree = TypeScriptParser.parse(fileContent);
    return extractPublicAPI(fileTree.rootNode, fileContent);
}

function extractPublicAPI(rootNode: SyntaxNode, fileContent: string): string {
    let scaffold = "";

    for (const child of rootNode.namedChildren) {
        if (!isExported(child, fileContent)) continue;

        const comments = getLeadingComments(child, fileContent);

        switch (child.type) {
            case "class_declaration":
                scaffold += comments + extractClassScaffold(child, fileContent) + "\n\n";
                break;

            case "function_declaration":
                scaffold += comments + extractFunctionScaffold(child, fileContent) + "\n\n";
                break;

            case "interface_declaration":
            case "type_alias_declaration":
                scaffold += comments + getNodeText(child, fileContent) + "\n\n";
                break;

            case "variable_statement":
                scaffold += comments + extractExportedVariables(child, fileContent) + "\n";
                break;

            case "export_statement":
                // Handle export statements by processing their children
                for (const exportChild of child.namedChildren) {
                    const exportComments = getLeadingComments(exportChild, fileContent);
                    switch (exportChild.type) {
                        case "class_declaration":
                            scaffold +=
                                comments + exportComments + extractClassScaffold(exportChild, fileContent) + "\n\n";
                            break;
                        case "function_declaration":
                            scaffold +=
                                comments + exportComments + extractFunctionScaffold(exportChild, fileContent) + "\n\n";
                            break;
                        case "interface_declaration":
                        case "type_alias_declaration":
                            scaffold += comments + exportComments + getNodeText(exportChild, fileContent) + "\n\n";
                            break;
                        case "variable_statement":
                            scaffold +=
                                comments + exportComments + extractExportedVariables(exportChild, fileContent) + "\n";
                            break;
                    }
                }
                break;
        }
    }

    return scaffold.trim();
}

function isExported(node: SyntaxNode, content: string): boolean {
    const text = getNodeText(node, content);
    return /^export\s/.test(text) || node.parent?.type === "export_statement";
}

function extractClassScaffold(node: SyntaxNode, content: string): string {
    const header = getNodeText(node, content).split("{")[0].trim() + " {";
    let body = "";

    const classBody = node.namedChildren.find((c) => c.type === "class_body");

    if (classBody) {
        for (const member of classBody.namedChildren) {
            const memberText = getNodeText(member, content).trim();

            const isExplicitlyPrivate = /\b(private|protected)\b/.test(memberText);
            const isPrivateField = memberText.startsWith("#");

            if (isExplicitlyPrivate || isPrivateField) continue;

            const comments = getLeadingComments(member, content);

            if (member.type === "method_definition") {
                body += comments + "  " + extractMethodSignature(member, content) + "\n";
            } else if (member.type === "public_field_definition" || member.type === "property_signature") {
                body += comments + "  " + extractPropertySignature(member, content) + "\n";
            }
        }
    }

    return header + "\n" + body + "}";
}

function extractFunctionScaffold(node: SyntaxNode, content: string): string {
    const text = getNodeText(node, content);
    return text.split("{")[0].trim().replace(/;?$/, ";");
}

function extractExportedVariables(node: SyntaxNode, content: string): string {
    const text = getNodeText(node, content);
    return text.split("=")[0].trim().replace(/;?$/, ";");
}

function extractMethodSignature(node: SyntaxNode, content: string): string {
    const text = getNodeText(node, content).split("{")[0].trim();
    const cleaned = text.replace(/^.*?\bfunction\b\s*/, "");
    const result = cleaned.endsWith(";") ? cleaned : cleaned + ";";
    return result.startsWith("public ") ? result : "public " + result;
}

function extractPropertySignature(node: SyntaxNode, content: string): string {
    const text = getNodeText(node, content)
        .replace(/\s*=\s*[^;]+/, "")
        .trim();
    const result = text.endsWith(";") ? text : text + ";";
    return result.startsWith("public ") ? result : "public " + result;
}

function getNodeText(node: SyntaxNode, content: string): string {
    return content.slice(node.startIndex, node.endIndex);
}

function getLeadingComments(node: SyntaxNode, content: string): string {
    const parent = node.parent;
    if (!parent) return "";

    const siblings = parent.children;
    const index = siblings.findIndex((n) => n.id === node.id);
    if (index === -1) return "";

    const comments: string[] = [];

    for (let i = index - 1; i >= 0; i--) {
        const prev = siblings[i];
        if (!prev) break;

        if (prev.type === "comment") {
            comments.unshift(getNodeText(prev, content));
        } else if (/^\s*$/.test(getNodeText(prev, content))) {
            continue;
        } else {
            break;
        }
    }

    if (comments.length === 0) return "";
    return comments.map((c) => c + "\n").join("");
}
