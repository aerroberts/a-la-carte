import type { Command as CommanderCommand } from "commander";
import type { Logger } from "./utils/logger";

export interface CommandRegistration {
    name: string;
    description: string;
    register(program: CommanderCommand, logger: Logger): void;
}
