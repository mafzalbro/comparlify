
import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>

export const tasks: Task[] = [
    {
      "id": "TASK-8782",
      "title": "You can't compress the program without quantifying the open-source SSD pixel!",
      "status": "in progress",
      "label": "documentation",
      "priority": "medium"
    },
    {
      "id": "TASK-7878",
      "title": "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
      "status": "backlog",
      "label": "documentation",
      "priority": "medium"
    },
    {
      "id": "TASK-7839",
      "title": "We need to bypass the neural TCP card!",
      "status": "todo",
      "label": "bug",
      "priority": "high"
    },
    {
      "id": "TASK-5562",
      "title": "The SAS interface is down, navigate the annual interface to new interface!",
      "status": "backlog",
      "label": "feature",
      "priority": "medium"
    },
    {
      "id": "TASK-8686",
      "title": "I'll parse the digital UDP pixel, that should protocol the SMTP interface!",
      "status": "canceled",
      "label": "feature",
      "priority": "medium"
    },
    {
        "id": "TASK-1210",
        "title": "We need to encrypt the auxiliary HTTP protocol!",
        "status": "in progress",
        "label": "feature",
        "priority": "high"
    },
    {
        "id": "TASK-4237",
        "title": "If we connect the protocol, we can get to the SMTP feed through the virtual EXE interface!",
        "status": "done",
        "label": "bug",
        "priority": "low"
    }
  ]
  