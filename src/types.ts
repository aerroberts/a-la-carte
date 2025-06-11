import type { Command as CommanderCommand } from "commander";

export interface CommandRegistration {
    name: string;
    description: string;
    register(program: CommanderCommand): void;
}
