import { Log } from "../../utils/logger";
import { Config } from "../../utils/state";

export interface SetApiConcurrencyArgs {
    concurrency: string;
}

export async function setApiConcurrencyConfigHandler({ concurrency }: SetApiConcurrencyArgs): Promise<void> {
    const num = Number.parseInt(concurrency, 10);
    if (Number.isNaN(num)) {
        Log.error("Concurrency must be a valid number");
        process.exit(1);
    }

    if (num <= 0) {
        Log.error("API concurrency must be a positive number");
        process.exit(1);
    }

    if (num > 100) {
        Log.error("API concurrency cannot exceed 100 for safety reasons");
        process.exit(1);
    }

    Config.setKey("api-concurrency", num);
}
