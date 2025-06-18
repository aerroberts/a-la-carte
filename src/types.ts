import type { Command as CommanderCommand } from "commander";

export type CommandRegistrator = (program: CommanderCommand) => void;
