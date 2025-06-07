import { useState } from 'react'
import './App.css'
import TaskItem from './TaskItem';

// placeholder tasks for before i have a real backend
const placeholderTasks = [
  {
    id:1,
    text: "Finish the todo app!",
    completed: false,
    children: [
      {
        id:2, text: "subtask1", completed:true, children: []
      },
      {
        id:3, text: "subtask2", completed:false, children: []
      },
    ]
  },
  {
    id: 4,
    text: "some other task",
    completed: false,
    children: [],
  },
];

function App() {
  const [tasks, setTasks] = useState(placeholderTasks);

  const updateTaskInTree = (nodes, taskId, updateFn) => {
    return nodes.map(node => {
      if (node.id === taskId) {
        return updateFn(node);
      }
      
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateTaskInTree(node.children, taskId, updateFn) };
      }
      return node;
    });
  };

  const handleToggleComplete = (taskId) => {
    const newTasks = updateTaskInTree(tasks, taskId, (task) => ({
      ...task,
      completed: !task.completed,
    }));
    setTasks(newTasks);
  };

  const deleteTaskFromTree = (nodes,taskId) => {
    const newNodes = nodes.filter(node => node.id !== taskId);

    return newNodes.map(node => {
      if (node.children && node.children.length > 0) {
        return { ...node, children: deleteTaskFromTree(node.children, taskId) };
      }
      return node;
    });
  };

  const handleDeleteTask = (taskId) => {
    const newTasks = deleteTaskFromTree(tasks, taskId);
    setTasks(newTasks);
  };

  return (
    <div className="app-container">
      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            onToggle={handleToggleComplete}
            onDelete={handleDeleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
