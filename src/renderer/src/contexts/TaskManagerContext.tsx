import React, { createContext, useReducer, useContext, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"

export interface TaskType {
  id: string
  name: string
  desc: string
  type: "download" | "extract"
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
  startDownload(name: string, desc: string, url: string, outputPath: string, onFinish: (status: boolean, path: string, error: Error | null) => void): Promise<void>
  startExtract(name: string, desc: string, filePath: string, outputPath: string, onFinish: (status: boolean, error: Error | null) => void): Promise<void>
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
        tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { progress, status: "in-progress" } } })
      })

      window.api.utils.logMessage("info", `[component] [TaskManager] Adding listener for extraction progress`)
      window.api.pathsManager.onExtractProgress((_event, id, progress) => {
        tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { progress, status: "in-progress" } } })
      })
    }
  }, [])

  async function startDownload(name: string, desc: string, url: string, outputPath: string, onFinish: (status: boolean, path: string, error: Error | null) => void): Promise<void> {
    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Started download.")
      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Adding download of ${url} to ${outputPath}.`)
      tasksDispatch({ type: ACTIONS.ADD_TASK, payload: { id, name, desc, type: "download", progress: 0, status: "pending" } })

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Downloading ${url}...`)
      addNotification(t("notifications.titles.info"), t("notifications.body.downloading", { downloadName: name }), "info")
      const downloadedFile = await window.api.pathsManager.downloadOnPath(id, url, outputPath)

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Downloaded ${url} to ${downloadedFile}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "completed" } } })
      addNotification(t("notifications.titles.success"), t("notifications.body.downloaded", { downloadName: name }), "success")
      onFinish(true, downloadedFile, null)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [TaskManager] [${id}] Error downloading ${url}: ${err}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "failed" } } })
      addNotification(t("notifications.titles.error"), t("notifications.body.downloadError", { downloadName: name }), "error")
      onFinish(false, "", new Error(`Error downloading ${url}: ${err}`))
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished download.")
    }
  }

  async function startExtract(name: string, desc: string, filePath: string, outputPath: string, onFinish: (status: boolean, error: Error | null) => void): Promise<void> {
    const id = uuidv4()

    try {
      window.api.utils.setPreventAppClose("add", id, "Started extraction.")
      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Adding extraction of ${filePath} to ${outputPath}.`)
      tasksDispatch({ type: ACTIONS.ADD_TASK, payload: { id, name, desc, type: "extract", progress: 0, status: "pending" } })

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Extracting ${filePath}...`)
      addNotification(t("notifications.titles.info"), t("notifications.body.extracting", { extractName: name }), "info")
      const result = await window.api.pathsManager.extractOnPath(id, filePath, outputPath)

      if (!result) {
        throw new Error("Extraction failed")
      }

      window.api.pathsManager.changePerms([outputPath], 0o755)

      window.api.utils.logMessage("info", `[component] [TaskManager] [${id}] Extracted ${filePath} to ${outputPath}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "completed" } } })
      addNotification(t("notifications.titles.success"), t("notifications.body.extracted", { extractName: name }), "success")
      onFinish(true, null)
    } catch (err) {
      window.api.utils.logMessage("error", `[component] [TaskManager] [${id}] Error extracting ${filePath}: ${err}`)
      tasksDispatch({ type: ACTIONS.UPDATE_TASK, payload: { id, updates: { status: "failed" } } })
      addNotification(t("notifications.titles.error"), t("notifications.body.extractError", { extractName: name }), "error")
      onFinish(false, new Error(`Error extracting ${filePath}: ${err}`))
    } finally {
      window.api.utils.setPreventAppClose("remove", id, "Finished extraction.")
    }
  }

  function removeTask(id: string): void {
    tasksDispatch({ type: ACTIONS.REMOVE_TASK, payload: { id } })
  }

  return <TaskContext.Provider value={{ tasks, startDownload, startExtract, removeTask }}>{children}</TaskContext.Provider>
}

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within an TaskProvider")
  }
  return context
}
