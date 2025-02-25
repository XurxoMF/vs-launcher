export function useQueryMods(): ({
  textFilter,
  authorFilter,
  versionsFilter,
  tagsFilter,
  orderBy,
  orderByOrder,
  onFinish
}: {
  textFilter?: string
  authorFilter?: DownloadableModAuthorType
  versionsFilter?: DownloadableModGameVersionType[]
  tagsFilter?: DownloadableModTagType[]
  orderBy?: string
  orderByOrder?: string
  onFinish?: () => void
}) => Promise<DownloadableModOnListType[]> {
  /**
   * Makes a query and returns all the mods. Accepts the listed filters.
   *
   * @param {object} props
   * @param {string} [props.textFilter] Optional string to filter by name and description.
   * @param {DownloadableModAuthorType} [props.authorFilter] Optional author to filter by.
   * @param {DownloadableModGameVersionType[]} [props.versionsFilter] Optional list of versions to filter by.
   * @param {string} [props.orderBy] Optional string to order by. Defaults to "follows".
   * @param {string} [props.orderByOrder] Optional string to set the order. Defaults to "desc".
   * @param {() => void} [props.onFinish] Optional function that will be called just before returning the mods list.
   * @returns {Promise<void>}
   */
  async function queryMods({
    textFilter,
    authorFilter,
    versionsFilter,
    tagsFilter,
    orderBy = "follows",
    orderByOrder = "desc",
    onFinish
  }: {
    textFilter?: string
    authorFilter?: DownloadableModAuthorType
    versionsFilter?: DownloadableModGameVersionType[]
    tagsFilter?: DownloadableModTagType[]
    orderBy?: string
    orderByOrder?: string
    onFinish?: () => void
  }): Promise<DownloadableModOnListType[]> {
    try {
      const filters: string[] = []

      if (textFilter && textFilter.length > 1) filters.push(`text=${textFilter}`)
      if (authorFilter && authorFilter.name.length > 1) filters.push(`author=${authorFilter.userid}`)
      if (versionsFilter && versionsFilter.length > 0) versionsFilter.map((version) => filters.push(`gameversions[]=${version.tagid}`))
      if (tagsFilter && tagsFilter.length > 0) tagsFilter.map((tag) => filters.push(`tagids[]=${tag.tagid}`))
      filters.push(`orderby=${orderBy}`)
      filters.push(`orderdirection=${orderByOrder}`)

      const res = await window.api.netManager.queryURL(`https://mods.vintagestory.at/api/mods${filters.length > 0 && `?${filters.join("&")}`}`)
      const data = await JSON.parse(res)

      if (onFinish) onFinish()

      return data["mods"]
    } catch (err) {
      window.api.utils.logMessage("error", `[front] [mods] [features/mods/hooks/useQueryMods.ts] [useQueryMods > queryMods] Error fetching mods.`)
      window.api.utils.logMessage("debug", `[front] [mods] [features/mods/hooks/useQueryMods.ts] [useQueryMods > queryMods] Error fetching mods: ${err}`)
      return []
    }
  }

  return queryMods
}
