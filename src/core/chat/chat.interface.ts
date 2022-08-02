export interface ChatDto {
    type: "message"
    content: string
}

export interface FastForwardDto {
    type: "ff"
    seconds: number
}

export type MessageDto = ChatDto | FastForwardDto

export class InvalidCommand extends Error {
    constructor(message: string) {
        super(message)
    }
}
