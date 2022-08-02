export const isValidHttpUrl = (s: string) => {
    let url: URL

    try {
        url = new URL(s)
    } catch (_) {
        return false
    }

    return url.protocol === "http:" || url.protocol === "https:"
}
