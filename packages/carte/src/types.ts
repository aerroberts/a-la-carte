import type { WatchArgs } from "./commands/code/watch";

export interface CarteWorkspaceConfig {
    provider: string;
    modelId: string;
    actions: Record<string, CarteAction>;
}

type CarteAction = CarteAction_watch;

export interface CarteAction_watch {
    type: "watch";
    args: WatchArgs;
}
