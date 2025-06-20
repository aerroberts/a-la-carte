import { Log } from "./utils/logger";

export class CarteError extends Error {
    constructor(message: string) {
        super(message);
        Log.error(`${this.constructor.name}: ${message}`);
    }
}

export class ConfigLoadError extends CarteError {}
export class FileNotFoundError extends CarteError {}
