import { exec } from "node:child_process";
import { Log } from "./logger";

export async function bash(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                Log.error(`Error executing command: ${command}`);
                Log.log(`stdout: ${stdout}`);
                Log.log(`stderr: ${stderr}`);
                reject(error);
                return;
            }
            if (stdout || stderr) {
                Log.log("--------------------------------");
            }
            if (stdout) {
                Log.log(stdout.replaceAll("\n", "\n    "));
            }
            if (stderr) {
                Log.log(stderr.replaceAll("\n", "\n    "));
            }
            if (stdout || stderr) {
                Log.log("--------------------------------");
            }
            resolve(stdout + stderr);
        });
    });
}
