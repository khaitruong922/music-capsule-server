export class InvalidCommand extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class InvalidFastForward extends InvalidCommand {
    constructor(message: string) {
        super(`Fast forward failed - ${message}`)
    }
}

export class InvalidSkip extends InvalidCommand {
    constructor(message: string) {
        super(`Skip failed - ${message}`)
    }
}
