import React, { createContext, useReducer, useContext, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

export interface TaskType {
  id: string
  name: string
  desc: string
  type: "download" | "extract" | "compress"
  progress: number
  status: "pending" | "in-progress" | "completed" | "failed"
}

export enum ACTIONS {
  ADD_TASK = "ADD_TASK",
  UPDATE_TASK = "UPDATE_TASK",
  REMOVE_TASK = "REMOVE_TASK"
}

export interface AddTaskAction {
  type: ACTIONS.ADD_TASK
  payload: TaskType
}

export interface UpdateTaskAction {
  type: ACTIONS.UPDATE_TASK
  payload: {
    id: string
    updates: Partial<Omit<TaskType, "id">>
  }
}

export interface RemoveTaskAction {
  type: ACTIONS.REMOVE_TASK
  payload: { id: string }
}

export type TaskAction = AddTaskAction | UpdateTaskAction | RemoveTaskAction

export function taskReducer(state: TaskType[], action: TaskAction): TaskType[] {
  switch (action.type) {
    case ACTIONS.ADD_TASK:
      return [action.payload, ...state]
    case ACTIONS.UPDATE_TASK:
      return state.map((task) => (task.id === action.payload.id ? { ...task, ...action.payload.updates } : task))
    case ACTIONS.REMOVE_TASK:
      return state.filter((task) => task.id !== action.payload.id)
    default:
      return state
  }
}

export const initialState: TaskType[] = []

export interface TaskContextType {
  tasks: TaskType[]
  startDownload(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    url: string,
    outputPath: string,
    fileName: string,
    onFinish: (status: boolean, path: string, error: Error | null) => void
  ): Promise<void>
  startExtract(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    filePath: string,
    outputPath: string,
    deleteZip: boolean,
    onFinish: (status: boolean, error: Error | null) => void
  ): Promise<void>
  startCompress(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    inputPath: string,
    outputPath: string,
    backupName: string,
    onFinish: (status: boolean, error: Error | null) => void
  ): Promise<void>
  removeTask(id: string): void
}

const TaskContext = createContext<TaskContextType | null>(null)

export const TaskProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()

  const [tasks, tasksDispatch] = useReducer(taskReducer, initialState)

  const firstExecutedTaskManagerContext = useRef(true)
  useEffect(() => {
    if (firstExecutedTaskManagerContext) {
      firstExecutedTaskManagerContext.current = false

      window.api.utils.logMessage("info", `[component] [TaskManager] Adding listener for download progress`)
      window.api.pathsManager.onDownloadProgress((_event, id, progress) => {
        if (progress === 100) return tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "completed" } } })
        tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { progress, status: "in-progress" } } })
      })

      window.api.utils.logMessage("info", `[component] [TaskManager] Adding listener for extraction progress`)
      window.api.pathsManager.onExtractProgress((_event, id, progress) => {
        if (progress === 100) return tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "completed" } } })
        tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { progress, status: "in-progress" } } })
      })

      window.api.utils.logMessage("info", `[component] [TaskManager] Adding listener for compress progress`)
      window.api.pathsManager.onCompressProgress((_event, id, progress) => {
        if (progress === 100) return tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "completed" } } })
        tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { progress, status: "in-progress" } } })
      })
    }
  }, [])

  async function startDownload(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    url: string,
    outputPath: string,
    fileName: string,
    onFinish: (status: boolean, path: string, error: Error | null) => void
  ): Promise<void> {
    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Started download.")
      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Adding download of ${url} to ${outputPath}.`)
      tasksDispatch({ type: ACTIONS.ADD_TASK, payload: { id, name, desc, type: "download", progress: 0, status: "pending" } })

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Downloading ${url}...`)
      if (notifications === "all" || notifications === "start") addNotification(t("notifications.body.downloading", { downloadName: name }), "info")
      const downloadedFile = await window.api.pathsManager.downloadOnPath(id, url, outputPath, fileName)

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Downloaded ${url} to ${downloadedFile}`)
      if (notifications === "all" || notifications === "end") addNotification(t("notifications.body.downloaded", { downloadName: name }), "success")
      onFinish(true, downloadedFile, null)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [TaskManager] [${id}] Error downloading ${url}: ${err}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "failed" } } })
      addNotification(t("notifications.body.downloadError", { downloadName: name }), "error")
      onFinish(false, "", new Error(`Error downloading ${url}: ${err}`))
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished download.")
    }
  }

  async function startExtract(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    filePath: string,
    outputPath: string,
    deleteZip: boolean,
    onFinish: (status: boolean, error: Error | null) => void
  ): Promise<void> {
    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Started extraction.")
      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Adding extraction of ${filePath} to ${outputPath}.`)
      tasksDispatch({ type: ACTIONS.ADD_TASK, payload: { id, name, desc, type: "extract", progress: 0, status: "pending" } })

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Extracting ${filePath}...`)
      if (notifications === "all" || notifications === "start") addNotification(t("notifications.body.extracting", { extractName: name }), "info")
      const result = await window.api.pathsManager.extractOnPath(id, filePath, outputPath, deleteZip)

      if (!result) throw new Error("Extraction failed")

      window.api.pathsManager.changePerms([outputPath], 0o755)

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Extracted ${filePath} to ${outputPath}`)
      if (notifications === "all" || notifications === "end") addNotification(t("notifications.body.extracted", { extractName: name }), "success")
      onFinish(true, null)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [TaskManager] [${id}] Error extracting ${filePath}: ${err}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "failed" } } })
      addNotification(t("notifications.body.extractError", { extractName: name }), "error")
      onFinish(false, new Error(`Error extracting ${filePath}: ${err}`))
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished extraction.")
    }
  }

  async function startCompress(
    name: string,
    desc: string,
    notifications: "all" | "start" | "end" | "none",
    inputPath: string,
    outputPath: string,
    backupName: string,
    onFinish: (status: boolean, error: Error | null) => void
  ): Promise<void> {
    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Started compression.")
      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Adding compression of ${inputPath} to ${outputPath}.`)
      tasksDispatch({ type: ACTIONS.ADD_TASK, payload: { id, name, desc, type: "compress", progress: 0, status: "pending" } })

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Compressing ${inputPath}...`)
      if (notifications === "all" || notifications === "start") addNotification(t("notifications.body.compressing", { compressName: name }), "info")
      const result = await window.api.pathsManager.compressOnPath(id, inputPath, outputPath, backupName)

      if (!result) throw new Error("Compression failed")

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Compressed ${inputPath} to ${outputPath}`)
      if (notifications === "all" || notifications === "end") addNotification(t("notifications.body.compressed", { compressName: name }), "success")
      onFinish(true, null)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [TaskManager] [${id}] Error compressing ${inputPath}: ${err}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "failed" } } })
      addNotification(t("notifications.body.compressError", { compressName: name }), "error")
      onFinish(false, new Error(`Error comrpessing ${inputPath}: ${err}`))
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished compression.")
    }
  }

  function removeTask(id: string): void {
    tasksDispatch({ type: ACTIONS.REMOVE_TASK, payload: { id } })
  }

  return <TaskContext.Provider value={{ tasks, startDownload, startExtract, startCompress, removeTask }}>{children}</TaskContext.Provider>
}

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within an TaskProvider")
  }
  return context
}
