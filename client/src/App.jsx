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

  return (
    <div className="app-container">
      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}

export default App;
