import { exec } from "node:child_process";
import { join } from "node:path";
import chalk from "chalk";

export async function bash(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.log(stdout + stderr);
                reject(error);
                return;
            }
            resolve(stdout + stderr);
        });
    });
}

export async function bashInNewTerminal(dir: string, command: string): Promise<void> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "/";
    const randomId = Math.random().toString(36).substring(2, 15);
    const scriptDir = join(homeDir, ".a-la-carte", "tmp", randomId);
    await bash(`mkdir -p ${scriptDir}`);

    const scriptPath = join(scriptDir, "run_bash.sh");

    const scriptContent = `#!/bin/bash\nclear\ncd "${dir}"\n${command}\n`;

    await bash(`cat > ${scriptPath} << 'EOF'\n${scriptContent}EOF`);
    await bash(`chmod +x ${scriptPath}`);
    await bash(`open -a Terminal ${scriptPath}`);

    console.log(`${chalk.gray("Running constructed script:")} ${chalk.whiteBright(scriptPath)}`);
}
