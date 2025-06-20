import { Storage } from "..";
import { ActionNotFoundError } from "../errors";
import { CarteWorkspaceConfig } from "../types";
import { Log } from "../utils/logger";
import { invokeAiHandler } from "./ai/invoke";
import { codeWatchHandler } from "./code/watch";
import { buildContextHandler } from "./context/build";

export interface RunArgs {
    action: string;
}

export async function runHandler(args: RunArgs): Promise<void> {
    const actions = Storage.loadWorkspaceKey<CarteWorkspaceConfig["actions"]>("actions");
    if (!actions[args.action]) {
        Log.log(`Available actions: ${Object.keys(actions).join(", ")}`);
        throw new ActionNotFoundError(`Action '${args.action}' not found in config`);
    }

    const action = actions[args.action];
    if (action.type === "watch") {
        await codeWatchHandler(action.args);
    }
    if (action.type === "build-context") {
        await buildContextHandler(action.args);
    }
    if (action.type === "invoke-ai") {
        await invokeAiHandler(action.args);
    }
}
