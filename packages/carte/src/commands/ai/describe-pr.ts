import chalk from "chalk";
import { bash } from "../../utils/bash";
import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";
import { invokeAiHandler } from "./invoke";

export interface DescribePrArgs {
    url: string;
}

export async function describePrAiHandler({ url }: DescribePrArgs): Promise<void> {
    Log.info("Asking AI to populate the description of a GitHub PR");
    Log.log(`PR URL: ${chalk.whiteBright(url)}`);

    const prDetails = await bash(`gh pr view ${url} --json title,body,files,commits`);
    const prDetailsJson = JSON.stringify(JSON.parse(prDetails), null, 2);
    const prDiff = await bash(`gh pr diff ${url}`);
    const prDetailsTmp = Config.writeToTmp(`${prDetailsJson}\n\n--- DIFF ---\n\n${prDiff}`);
    const prOutputTmp = Config.writeToTmp("", ".md");

    Log.log("Invoking AI to describe the PR");
    await invokeAiHandler({
        inputFilePath: prDetailsTmp,
        outputFilePath: prOutputTmp,
        prompts: ["pr-description", "formatted"],
    });

    await bash(`gh pr edit ${url} --body-file ${prOutputTmp}`);
    Log.success("PR description updated");
}
