import { Log } from "./utils/logger";

export class CarteError extends Error {
    constructor(message: string) {
        super(message);
        this.name = message;
        Log.error(message);
    }
}

export class ConfigLoadError extends CarteError {}
