export function useCleanFolderName(): ({ folderName }: { folderName: string }) => Promise<string> {
  /**
   * Removes invalid characters from a folder name and replaces spaces with dashes.
   *
   * @param {object} props
   * @param {string} [props.folderName] Folder name to clean.
   * @returns {Promise<void>}
   */
  async function cleanFolderName({ folderName }: { folderName: string }): Promise<string> {
    return folderName
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return cleanFolderName
}
