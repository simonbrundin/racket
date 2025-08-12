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

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  childIds: string[];
  parentIds: string[];
  assignedTo?: string;
  deadline?: string;
}

// Separat komponent för varje sorterbart objekt
interface SortableItemProps {
  id: string;
  todo: Todo;
  selectedIndex: number | null;
  index: number;
  handleToggleTodo: (id: string) => void;
  setSelectedIndex: (index: number) => void;
  level?: number;
  todos: Todo[];
}

function SortableItem({ id, todo, selectedIndex, index, handleToggleTodo, setSelectedIndex, level = 0, todos }: SortableItemProps) {
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
    marginLeft: `${level * 2}rem`,
  };

  const childTasks = todo.childIds
    .map((childId: string) => todos.find((t: Todo) => t.id === childId))
    .filter((t): t is Todo => t !== undefined);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex flex-col p-2 rounded w-full ${selectedIndex === index ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        onClick={() => setSelectedIndex(index)}
      >
        <div className="flex items-center space-x-2">
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
        <div className="flex items-center text-xs mt-1 ml-6 text-gray-500">
          {todo.assignedTo && (
            <span className="mr-2">Tilldelad: {todo.assignedTo}</span>
          )}
          {todo.deadline && (
            <span>Deadline: {todo.deadline}</span>
          )}
        </div>
      </div>
      {childTasks.map((subtask, subIndex) => (
        <SortableItem
          key={subtask.id}
          id={subtask.id}
          todo={subtask}
          selectedIndex={selectedIndex}
          index={subIndex}
          handleToggleTodo={handleToggleTodo}
          setSelectedIndex={setSelectedIndex}
          level={level + 1}
          todos={todos}
        />
      ))}
    </>
  );
}



export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "todo11",
      text: "Är den här avcheckad så fungerar allt",
      completed: true,
      childIds: [],
      parentIds: [],
    },
    {
      id: "todo0",
      text: "Går att bygga image via DOCKERFILE",
      completed: true,
      childIds: [],
      parentIds: [],
    },
    // ... other todos ...
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [editText, setEditText] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId) {
        // Ignore keyboard shortcuts when editing
        return;
      }
      
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
        case "I":
          if (selectedIndex !== null) {
            const parentTodo = todos[selectedIndex];
            const newSubtask: Todo = {
              id: `todo-${Date.now()}`,
              text: "New Subtask",
              completed: false,
              childIds: [],
              parentIds: [parentTodo.id],
            };
            setTodos(prev => [
              ...prev.map(todo => 
                todo.id === parentTodo.id 
                  ? { ...todo, childIds: [...todo.childIds, newSubtask.id] } 
                  : todo
              ),
              newSubtask
            ]);
          }
          break;
        case " ":
          e.preventDefault();
          if (selectedIndex !== null) {
            handleToggleTodo(todos[selectedIndex].id);
          }
          break;
        case "e":
          if (selectedIndex !== null) {
            const todo = todos[selectedIndex];
            setEditText(todo.text);
            setEditAssignedTo(todo.assignedTo || "");
            setEditDeadline(todo.deadline || "");
            setEditingId(todo.id);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [todos, selectedIndex, editingId, handleDeleteTodo, handleToggleTodo, moveTodo]);

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
    setTodos(prevTodos => {
      const newTodos = [...prevTodos];
      const todo = newTodos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        const toggleChildren = (childIds: string[]) => {
          childIds.forEach(childId => {
            const child = newTodos.find(t => t.id === childId);
            if (child) {
              child.completed = todo.completed;
              toggleChildren(child.childIds);
            }
          });
        };
        toggleChildren(todo.childIds);
      }
      return newTodos;
    });
  };

  const handleDeleteTodo = () => {
    if (selectedIndex === null) return;
    const todoToDelete = todos[selectedIndex];
    const newTodos = todos.filter(todo => todo.id !== todoToDelete.id && !todoToDelete.childIds.includes(todo.id));
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
    const newTodo: Todo = {
      id: `todo-${Date.now()}`,
      text: newTodoText,
      completed: false,
      childIds: [],
      parentIds: [],
      assignedTo: newAssignedTo.trim() ? newAssignedTo : undefined,
      deadline: newDeadline.trim() ? newDeadline : undefined,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText("");
    setNewAssignedTo("");
    setNewDeadline("");
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTodos((items) => {
        const activeIndex = items.findIndex(item => item.id === active.id);
        const overIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, activeIndex, overIndex);

        const activeTodo = newItems.find(item => item.id === active.id);
        const overTodo = newItems.find(item => item.id === over.id);

        if (activeTodo && overTodo) {
          // Remove from old parent
          activeTodo.parentIds.forEach(parentId => {
            const parent = newItems.find(item => item.id === parentId);
            if (parent) {
              parent.childIds = parent.childIds.filter(childId => childId !== active.id);
            }
          });

          // Add to new parent
          activeTodo.parentIds = [over.id];
          overTodo.childIds.push(active.id);
        }

        return newItems;
      });
    }
  }

  // Only count top-level tasks for progress
  const topLevelTodos = todos.filter(todo => todo.parentIds.length === 0);
  const completedCount = topLevelTodos.filter(todo => todo.completed).length;
  const totalCount = topLevelTodos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sort, setSort] = useState<'date' | 'assigned' | 'deadline'>('date');
  
  // Filter tasks
  let visibleTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // Sort tasks
  visibleTodos = [...visibleTodos].sort((a, b) => {
    if (sort === 'assigned') {
      const aAssigned = a.assignedTo || 'ZZZ';
      const bAssigned = b.assignedTo || 'ZZZ';
      return aAssigned.localeCompare(bAssigned);
    }
    if (sort === 'deadline') {
      const aDeadline = a.deadline || '9999-12-31';
      const bDeadline = b.deadline || '9999-12-31';
      return aDeadline.localeCompare(bDeadline);
    }
    // Default sort by creation date (id contains timestamp)
    return a.id.localeCompare(b.id);
  });
  
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Framsteg: {progressPercentage}%</span>
          <span className="text-sm text-gray-500">{completedCount}/{totalCount} uppgifter</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Alla
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Aktiva
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Klara
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={sort === 'date' ? 'default' : 'outline'}
            onClick={() => setSort('date')}
          >
            Datum
          </Button>
          <Button 
            variant={sort === 'assigned' ? 'default' : 'outline'}
            onClick={() => setSort('assigned')}
          >
            Tilldelad
          </Button>
          <Button 
            variant={sort === 'deadline' ? 'default' : 'outline'}
            onClick={() => setSort('deadline')}
          >
            Deadline
          </Button>
        </div>
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={todos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
      <div className="flex flex-col items-start space-y-2 mb-4">
        {visibleTodos.filter(todo => todo.parentIds.length === 0).map((todo, index) => {
          if (editingId === todo.id) {
            return (
              <div key={`edit-${todo.id}`} className="flex flex-col p-2 rounded w-full bg-gray-100 dark:bg-gray-800 mb-2">
                <div className="flex flex-col space-y-2">
                  <Input 
                    type="text" 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex space-x-2">
                    <Input 
                      type="text"
                      placeholder="Tilldelad"
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                      className="flex-1"
                    />
                    <Input 
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        setTodos(prev => prev.map(t => 
                          t.id === todo.id 
                            ? { ...t, text: editText, assignedTo: editAssignedTo.trim() || undefined, deadline: editDeadline.trim() || undefined } 
                            : t
                        ));
                        setEditingId(null);
                      }}
                    >
                      Spara
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Avbryt
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <SortableItem 
              key={todo.id} 
              id={todo.id} 
              todo={todo} 
              selectedIndex={selectedIndex} 
              index={index} 
              handleToggleTodo={handleToggleTodo}
              setSelectedIndex={setSelectedIndex}
              todos={todos}
            />
          );
        })}
      </div>
        </SortableContext>
      </DndContext>
      <form onSubmit={handleAddTodo} className="flex flex-col w-full max-w-md space-y-2">
        <div className="flex space-x-2">
          <Input 
            ref={inputRef}
            type="text" 
            placeholder="Ny uppgift..." 
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Lägg till</Button>
        </div>
        <div className="flex space-x-2">
          <Input 
            type="text"
            placeholder="Tilldelad (valfritt)"
            value={newAssignedTo}
            onChange={(e) => setNewAssignedTo(e.target.value)}
            className="flex-1"
          />
          <Input 
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="flex-1"
          />
        </div>
      </form>
    </div>
  );
}
