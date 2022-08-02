import { Injectable } from "@nestjs/common"
import { InvalidFastForward, InvalidSkip } from "./chat.exception"
import {
    FastForwardCommandDto,
    MessageDto,
    SkipIndexCommandDto,
} from "./chat.interface"

@Injectable()
export class ChatService {
    private COMMAND_PREFIX = "/"
    constructor() {}
    parseMessage(message: string): MessageDto {
        if (message.startsWith(this.COMMAND_PREFIX)) {
            if (message.startsWith(`${this.COMMAND_PREFIX}ff`))
                return this.fastForward(message)
            if (message.startsWith(`${this.COMMAND_PREFIX}skip`))
                return this.skipIndex(message)
        }
        return {
            type: "message",
            content: message,
        }
    }
    fastForward(message: string): FastForwardCommandDto {
        const s = message.split(" ")[1]
        const seconds = s ? parseInt(s, 10) : 5
        if (Number.isNaN(seconds) || seconds <= 0) {
            throw new InvalidFastForward("Invalid number")
        }
        return {
            type: "ff",
            seconds,
        }
    }
    skipIndex(message: string): SkipIndexCommandDto {
        const s = message.split(" ")[1]
        const i = s ? parseInt(s, 10) : 1
        if (Number.isNaN(i) || i <= 0) {
            throw new InvalidSkip("Invalid number")
        }
        return {
            type: "skip",
            i,
        }
    }
}
