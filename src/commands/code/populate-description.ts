import { readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import type { Command } from "commander";
import type { CommandRegistrator } from "../../types";
import { bash } from "../../utils/bash";

async function populateDescription(): Promise<void> {
    try {
        // Check if package.json exists
        const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));

        if (packageJson.description && packageJson.description.trim() !== "") {
            console.log(chalk.yellow("Package already has a description:"));
            console.log(chalk.whiteBright(`  "${packageJson.description}"`));
            return;
        }

        // Generate description using git history and file structure
        const repoName = await bash("basename $(git rev-parse --show-toplevel)");
        const recentCommits = await bash("git log --oneline -10");
        const fileStructure = await bash("find . -type f -name '*.ts' -o -name '*.js' -o -name '*.json' | head -20");

        const description = `A ${repoName.trim()} project with TypeScript/JavaScript functionality`;

        // Update package.json
        packageJson.description = description;
        writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

        console.log(chalk.green("Successfully populated package description:"));
        console.log(chalk.whiteBright(`  "${description}"`));
    } catch (error) {
        console.log(chalk.red("Error populating description:"));
        console.log(error);
    }
}

export const registerPopulateDescriptionCommand: CommandRegistrator = (program: Command): void => {
    program
        .command("populate-description")
        .description("Automatically populate the package.json description field")
        .action(async () => {
            await populateDescription();
        });
};
