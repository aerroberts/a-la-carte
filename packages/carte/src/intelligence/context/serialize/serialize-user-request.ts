export function serializeUserRequest(request: string): string {
    return `# User Request\n\n<user-request>\n${request}\n</user-request>`;
}
