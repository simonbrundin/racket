"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function TodoList() {
  // Lista med att-göra-uppgifter och deras initiala tillstånd
  const [todos, setTodos] = useState([
    {
      id: "todo0",
      text: "Går att bygga image via DOCKERFILE",
      completed: true,
    },
    {
      id: "todo1",
      text: "Åtkomst via plan.simonbrundin.com",
      completed: true,
    },
    {
      id: "todo3",
      text: "CI-pipeline",
      completed: true,
    },
    {
      id: "todo2",
      text: "Data kan visas från en databas",
      completed: false,
    },
    {
      id: "todo5",
      text: "Monitoring via Uptime Kuma",
      completed: true,
    },
    {
      id: "todo6",
      text: "Prata om vi ska ha ett git-workflow eller hur vi ska jobba",
      completed: false,
    },
  ]);

  // Hantera ändringar i checkbox
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center space-x-2">
          <Checkbox
            id={todo.id}
            checked={todo.completed}
            onCheckedChange={() => handleToggleTodo(todo.id)}
          />
          <Label
            htmlFor={todo.id}
            className={`text-sm font-medium leading-none ${
              todo.completed ? "line-through text-gray-500" : ""
            } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
          >
            {todo.text}
          </Label>
        </div>
      ))}
    </div>
  );
}
