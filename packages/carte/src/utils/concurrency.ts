import { Log } from "./logger";

export class Concurrency {
    private running = 0;
    private queue: Array<() => void> = [];

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
