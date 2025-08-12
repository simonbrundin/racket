"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Separat komponent för varje sorterbart objekt
function SortableItem({ id, todo, selectedIndex, index, handleToggleTodo, setSelectedIndex }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
<div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center space-x-2 p-2 rounded w-full ${selectedIndex === index ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      onClick={() => setSelectedIndex(index)}
    >
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
  );
}


export default function TodoList() {
  const [todos, setTodos] = useState([
    {
      id: "todo11",
      text: "Är den här avcheckad så fungerar allt",
      completed: true,
    },
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
    {
      id: "todo7",
      text: "Inloggning",
      completed: false,
    },
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        }
      }
      
      if (document.activeElement instanceof HTMLInputElement) {
        return;
      }

      if (e.key === 'i') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      
      if (selectedIndex === null) {
        if (e.key === 'j' || e.key === 'k') {
          setSelectedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case "j":
          setSelectedIndex((prev) => (prev === null ? 0 : Math.min(todos.length - 1, prev + 1)));
          break;
        case "k":
          setSelectedIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
          break;
        case "w":
          moveTodo(-1);
          break;
        case "s":
          moveTodo(1);
          break;
        case "g":
          setSelectedIndex(0);
          break;
        case "G":
          setSelectedIndex(todos.length - 1);
          break;
        case "x":
          handleDeleteTodo();
          break;
        case " ":
          e.preventDefault();
          if (selectedIndex !== null) {
            handleToggleTodo(todos[selectedIndex].id);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [todos, selectedIndex]);

  const moveTodo = (direction: number) => {
    if (selectedIndex === null) return;
    const newIndex = selectedIndex + direction;
    if (newIndex < 0 || newIndex >= todos.length) return;

    const newTodos = Array.from(todos);
    const [movedTodo] = newTodos.splice(selectedIndex, 1);
    newTodos.splice(newIndex, 0, movedTodo);
    setTodos(newTodos);
    setSelectedIndex(newIndex);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = () => {
    if (selectedIndex === null) return;
    const newTodos = todos.filter((_, index) => index !== selectedIndex);
    setTodos(newTodos);
    if (newTodos.length === 0) {
      setSelectedIndex(null);
    } else if (selectedIndex >= newTodos.length) {
      setSelectedIndex(newTodos.length - 1);
    }
  };

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() === "") return;
    const newTodo = {
      id: `todo-${Date.now()}`,
      text: newTodoText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText("");
  };

  function handleDragEnd(event: any) {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={todos}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col items-start space-y-2 mb-4">
            {todos.map((todo, index) => (
              <SortableItem 
                key={todo.id} 
                id={todo.id} 
                todo={todo} 
                selectedIndex={selectedIndex} 
                index={index} 
                handleToggleTodo={handleToggleTodo}
                setSelectedIndex={setSelectedIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <form onSubmit={handleAddTodo} className="flex w-full max-w-sm items-center space-x-2">
        <Input 
          ref={inputRef}
          type="text" 
          placeholder="Ny uppgift..." 
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
        />
        <Button type="submit">Lägg till</Button>
      </form>
    </div>
  );
}
