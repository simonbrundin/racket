export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  childIds: string[];
  parentIds: string[];
  assignedTo?: string;
  deadline?: string;
}
