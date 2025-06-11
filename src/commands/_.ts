import type { CommandRegistration } from "../command";
import { CoinflipCommand } from "./coinflip";

// To add a new command:
// 1. Create a new file in this directory (e.g., mycommand.ts)
// 2. Export a class that implements CommandRegistration
// 3. Import it here and add it to the Commands array
export const Commands: CommandRegistration[] = [new CoinflipCommand()];
