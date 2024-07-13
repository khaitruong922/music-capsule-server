import axios from "axios"
const youtubeEndpoint = `https://www.youtube.com`

// source: https://github.com/damonwonghv/youtube-search-api
export const getFirstVideoId = async (
    keyword: string,
): Promise<string | undefined> => {
    const endpoint = `${youtubeEndpoint}/results?search_query=${keyword}`
    try {
        const videoEndpoint = `${endpoint}&sp=EgIQAQ%3D%3D`
        const page = await getYoutubeInitData(videoEndpoint)

        const sectionListRenderer =
            page.initData.contents.twoColumnSearchResultsRenderer
                .primaryContents.sectionListRenderer

        for (const content of sectionListRenderer.contents) {
            const { itemSectionRenderer } = content
            if (!itemSectionRenderer) continue
            for (const item of itemSectionRenderer.contents) {
                if (item?.videoRenderer?.videoId) {
                    return item.videoRenderer.videoId
                }
                if (item?.playlistVideoRenderer?.videoId) {
                    return item.playlistVideoRenderer.videoId
                }
            }
        }
        return undefined
    } catch (ex) {
        console.error(ex)
        return await Promise.reject(ex)
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
