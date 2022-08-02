import { Injectable } from "@nestjs/common"
import { InvalidCommand, MessageDto } from "./chat.interface"

@Injectable()
export class ChatService {
    private COMMAND_PREFIX = "/"
    constructor() {}
    parseMessage(message: string): MessageDto {
        if (message.startsWith(this.COMMAND_PREFIX)) {
            if (message.startsWith(`${this.COMMAND_PREFIX}ff`)) {
                const seconds = parseInt(message.split(" ")[1], 10)
                if (Number.isNaN(seconds) || seconds <= 0) {
                    throw new InvalidCommand(
                        "Fast forward failed - Invalid number",
                    )
                }
                return {
                    type: "ff",
                    seconds,
                }
            }
        }
        return {
            type: "message",
            content: message,
        }
    }
}
