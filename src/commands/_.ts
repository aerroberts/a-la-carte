import type { CommandRegistration } from "../types";
import { CoinflipCommand } from "./coinflip";

export const Commands: CommandRegistration[] = [new CoinflipCommand()];
