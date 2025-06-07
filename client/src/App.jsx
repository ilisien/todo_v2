import { useState } from 'react'
import './App.css'

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
      <h1>todolist app v2</h1>
      {/* here is where tasks will be rendered */}
    </div>
  );
}

export default App;
