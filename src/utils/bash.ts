import { exec } from "node:child_process";

export async function bash(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout + stderr);
        });
    });
}
