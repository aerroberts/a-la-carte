import { Log } from "./logger";

/**
 * A class to manage concurrency and limit the number of concurrently running promises.
 */
export class Concurrency {
    private running = 0;
    private queue: Array<() => void> = [];

    /**
     * @param limit The maximum number of concurrent promises.
     */
    constructor(private limit: number) {
        if (limit <= 0) {
            throw new Error("Concurrency limit must be greater than 0");
        }
    }

    private _next(): void {
        this.running--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) {
                next();
            }
        }
    }

    /**
     * Runs a promise-returning function, respecting the concurrency limit.
     * If the limit is reached, the function is queued and will be executed when a slot is available.
     * @param fn The promise-returning function to execute.
     * @returns A promise that resolves with the result of the function.
     */
    public async run<T>(fn: () => Promise<T>): Promise<T> {
        if (this.running >= this.limit) {
            return new Promise<T>((resolve, reject) => {
                Log.log(`Waiting for concurrency slot, ${this.running} running, ${this.queue.length} queued`);
                this.queue.push(() => {
                    Log.log("Starting queued task");
                    this.run(fn).then(resolve).catch(reject);
                });
            });
        }

        this.running++;
        try {
            return await fn();
        } finally {
            this._next();
        }
    }
}
