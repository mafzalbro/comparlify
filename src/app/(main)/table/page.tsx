import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";
import { z } from "zod";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { taskSchema, tasks } from "./data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

// Simulate a database read for tasks.
async function getTasks() {
  return z.array(taskSchema).parse(tasks);
}

export default async function TaskPage() {
  const tasks = await getTasks();

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Tasks Table</CardTitle>
          <CardDescription>Here you can manage your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tasks} pageCount={10} />
        </CardContent>
      </Card>
    </div>
  );
}
