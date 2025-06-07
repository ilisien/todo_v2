import { useState, useEffect } from 'react';
import './App.css';
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

  const [focusTaskId, setFocusTaskId] = useState(null);

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

  const handleTextChange = (taskId, newText) => {
    const newTasks = updateTaskInTree(tasks, taskId, (task) => ({
      ...task,
      text: newText,
    }));
    setTasks(newTasks)
  }

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

  const handleAddTask = (currentTaskId) => {
    const newId = Date.now();
    let taskAdded = false;

    const addTaskInTree = (nodes) => {
      const result = [];
      for (const node of nodes) {
        result.push(node);
        if (node.id === currentTaskId) {
          result.push({ id: newId, text: "", completed: false, children: [] });
          taskAdded = true;
        }
        if (node.children && node.children.length > 0) {
          node.children = taskAdded ? node.children : addTaskInTree(node.children);
        }
      }
      return result;
    };

    const newTasks = addTaskInTree(JSON.parse(JSON.stringify(tasks)));
    setTasks(newTasks);

    setFocusTaskId(newId)
  };

  const handleFocusHandled = () => {
    setFocusTaskId(null);
  };

  const handleIndentChange = (taskId, direction) => {
    const newTasks = JSON.parse(JSON.stringify(tasks));

    function findAndMove(nodes, parentPath) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node.id === taskId) {
          if (direction === 'indent' && i > 0) {
            const nodeToMove = nodes.splice(i, 1)[0];
            const newParent = nodes[i-1];
            newParent.children.push(nodeToMove);
            return true;
          }
          else if (direction === 'unindent' && parentPath.length > 0) {
            const nodeToMove = nodes.splice(i, 1)[0];
            const parent = parentPath[parentPath.length - 1];
            const grandParentChildren = parentPath.length > 1 ? parentPath[parentPath.length - 2].children : newTasks;
            const parentIndex = grandParentChildren.findIndex(n => n.id === parent.id);
            grandParentChildren.splice(parentIndex + 1, 0, nodeToMove);
            return true;
          }
          return false;
        }
        if (node.children && node.children.length > 0) {
          if (findAndMove(node.children, [...parentPath,node])) {
            return true;
          }
        }
      }
      return false;
    }

    findAndMove(newTasks, []);
    setFocusTaskId(taskId)
    setTasks(newTasks);
  };

  return (
    <div className="app-container">
      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            focusTaskId={focusTaskId}
            onFocusHandled={handleFocusHandled}
            onTextChange={handleTextChange}
            onToggle={handleToggleComplete}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
            onIndentChange={handleIndentChange}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
