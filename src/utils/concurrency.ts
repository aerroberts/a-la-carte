import { Log } from "./logger";

export class Concurrency {
    private running = 0;
    private queue: Array<() => Promise<void>> = [];

    constructor(private limit: number) {}

    async run<T>(fn: () => Promise<T>): Promise<T> {
        if (this.running >= this.limit) {
            return new Promise<T>((resolve, reject) => {
                Log.log(`Waiting for concurrency slot, ${this.running} running, ${this.queue.length} queued`);
                this.queue.push(async () => {
                    Log.log("Starting queued task");
                    try {
                        const result = await fn();
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    } finally {
                        this.running--;
                        if (this.queue.length > 0) {
                            const next = this.queue.shift();
                            if (next) {
                                next();
                            }
                        }
                    }
                });
            });
        }

        this.running++;
        try {
            const result = await fn();
            return result;
        } finally {
            this.running--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                if (next) {
                    next();
                }
            }
        }
    }
}
