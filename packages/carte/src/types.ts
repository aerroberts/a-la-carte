import type { WatchArgs } from "./commands/code/watch";
import { BuildContextArgs } from "./commands/context/build";

export interface CarteWorkspaceConfig {
    provider: string;
    modelId: string;
    actions: Record<string, CarteAction>;
}

type CarteAction = CarteAction_watch | CarteAction_buildContext;

export interface CarteAction_watch {
    type: "watch";
    args: WatchArgs;
}

export interface CarteAction_buildContext {
    type: "build-context";
    args: BuildContextArgs;
}
