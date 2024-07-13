import axios from "axios"
const youtubeEndpoint = `https://www.youtube.com`

// source: https://github.com/damonwonghv/youtube-search-api
export const getFirstVideoId = async (
    keyword: string,
): Promise<string | undefined> => {
    let endpoint = `${youtubeEndpoint}/results?search_query=${keyword}`
    try {
        const videoEndpoint = `${endpoint}&sp=EgIQAQ%3D%3D`
        const page = await getYoutubeInitData(videoEndpoint)

        const sectionListRenderer =
            page.initData.contents.twoColumnSearchResultsRenderer
                .primaryContents.sectionListRenderer
        let items = []

        for (const content of sectionListRenderer.contents) {
            const { itemSectionRenderer } = content
            if (!itemSectionRenderer) continue
            for (const item of itemSectionRenderer.contents) {
                if (item?.videoRenderer?.videoId) {
                    items.push(createVideoRender(item))
                    break
                }
            }
            if (items.length > 0) break
        }
        return items?.[0]?.id
    } catch (ex) {
        console.error(ex)
        return await Promise.reject(ex)
    }
}

const createVideoRender = (json: any) => {
    try {
        if (json && (json.videoRenderer || json.playlistVideoRenderer)) {
            let videoRenderer = null
            if (json.videoRenderer) {
                videoRenderer = json.videoRenderer
            } else if (json.playlistVideoRenderer) {
                videoRenderer = json.playlistVideoRenderer
            }
            var isLive = false
            if (
                videoRenderer.badges &&
                videoRenderer.badges.length > 0 &&
                videoRenderer.badges[0].metadataBadgeRenderer &&
                videoRenderer.badges[0].metadataBadgeRenderer.style ==
                    "BADGE_STYLE_TYPE_LIVE_NOW"
            ) {
                isLive = true
            }
            if (videoRenderer.thumbnailOverlays) {
                videoRenderer.thumbnailOverlays.forEach((item: any) => {
                    if (
                        item.thumbnailOverlayTimeStatusRenderer &&
                        item.thumbnailOverlayTimeStatusRenderer.style &&
                        item.thumbnailOverlayTimeStatusRenderer.style == "LIVE"
                    ) {
                        isLive = true
                    }
                })
            }
            const id = videoRenderer.videoId
            const thumbnail = videoRenderer.thumbnail
            const title = videoRenderer.title.runs[0].text
            const shortBylineText = videoRenderer.shortBylineText
                ? videoRenderer.shortBylineText
                : ""
            const lengthText = videoRenderer.lengthText
                ? videoRenderer.lengthText
                : ""
            const channelTitle =
                videoRenderer.ownerText && videoRenderer.ownerText.runs
                    ? videoRenderer.ownerText.runs[0].text
                    : ""
            return {
                id,
                type: "video",
                thumbnail,
                title,
                channelTitle,
                shortBylineText,
                length: lengthText,
                isLive,
            }
        } else {
            return {}
        }
    } catch (ex) {
        throw ex
    }
}

const getYoutubeInitData = async (url: string) => {
    let initData: any = {}
    let apiToken = null
    let context = null
    try {
        const page = await axios.get(encodeURI(url))
        const ytInitData = await page.data.split("var ytInitialData =")
        if (ytInitData && ytInitData.length > 1) {
            const data = await ytInitData[1].split("</script>")[0].slice(0, -1)

            if (page.data.split("innertubeApiKey").length > 0) {
                apiToken = await page.data
                    .split("innertubeApiKey")[1]
                    .trim()
                    .split(",")[0]
                    .split('"')[2]
            }

            if (page.data.split("INNERTUBE_CONTEXT").length > 0) {
                context = await JSON.parse(
                    page.data.split("INNERTUBE_CONTEXT")[1].trim().slice(2, -2),
                )
            }

            initData = await JSON.parse(data)
            return await Promise.resolve({
                initData,
                apiToken,
                context,
            })
        } else {
            console.error("cannot_get_init_data")
            return await Promise.reject("cannot_get_init_data")
        }
    } catch (ex) {
        console.error(ex)
        return await Promise.reject(ex)
    }
}
