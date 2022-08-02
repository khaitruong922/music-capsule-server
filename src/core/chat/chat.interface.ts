export interface ChatDto {
    type: "message"
    content: string
}

export interface FastForwardCommandDto {
    type: "ff"
    seconds: number
}

export interface SkipIndexCommandDto {
    type: "skip"
    i: number
}

export type MessageDto = ChatDto | FastForwardCommandDto | SkipIndexCommandDto
