import { useState, useEffect } from 'react';
import './App.css';
import TaskItem from './TaskItem.jsx';

function TodoApp({ token }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/blob', {
        headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`},
    })
      .then(res => res.json())
      .then(data => {
        // Check if the data from the server is empty or null
        if (data && Array.isArray(data) && data.length > 0) {
          // If we have data, just set it as normal.
          setTasks(data);
        } else {
          const firstTaskId = Date.now();
          const firstTask = {
            id: firstTaskId,
            text: "",
            completed: false,
            children: [],
          };
          
          setTasks([firstTask]);
          
          setFocusTaskId(firstTaskId);
        }
      })
      .catch(error => {
        console.error("Error fetching blob:", error);
        // It's also good practice to handle fetch errors by creating a default task
        // so the app is still usable even if the backend is down on first load.
        const firstTaskId = Date.now();
        const firstTask = { id: firstTaskId, text: "", completed: false, children: [] };
        setTasks([firstTask]);
        setFocusTaskId(firstTaskId);
      });
  }, [token]);

  const [focusTaskId, setFocusTaskId] = useState(null);

  const syncStateWithBackend = (newState) => {
    fetch('http://localhost:5000/api/blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`},
      body: JSON.stringify(newState)
    });
  };

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
    setTasks(newTasks);
    syncStateWithBackend(newTasks);
  }

  const handleToggleComplete = (taskId) => {
    const newTasks = updateTaskInTree(tasks, taskId, (task) => ({
      ...task,
      completed: !task.completed,
    }));
    setTasks(newTasks);
    syncStateWithBackend(newTasks);
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
    syncStateWithBackend(newTasks)
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
    syncStateWithBackend(newTasks)
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
    syncStateWithBackend(newTasks)
  };

  const getTaskOrder = () => {
    const ids = [];
    const traverse = (nodes) => {
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    traverse(tasks);
    return ids;
  };

  const handleFocusNavigation = (currentTaskId, direction) => {
    const orderedIds = getTaskOrder();
    const currentIndex = orderedIds.indexOf(currentTaskId);

    let nextIndex;
    if (direction === 'up') {
      nextIndex = currentIndex - 1;
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= 0 && nextIndex < orderedIds.length) {
      const nextTaskId = orderedIds[nextIndex];
      setFocusTaskId(nextTaskId);
    }
  };

  const handleMoveTask = (taskId, direction) => {
    const newTasks = JSON.parse(JSON.stringify(tasks));

    let taskMoved = false;
    const findAndMove = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === taskId) {
          if (direction === 'up' && i > 0) {
            [nodes[i], nodes[i - 1]] = [nodes[i - 1], nodes[i]];
            taskMoved = true;
            return;
          }
          if (direction === 'down' && i < nodes.length - 1) {
            [nodes[i], nodes[i + 1]] = [nodes[i + 1], nodes[i]];
            taskMoved = true;
            return;
          }
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          findAndMove(nodes[i].children);
          if (taskMoved) return;
        }
      }
    };

    findAndMove(newTasks);

    if (taskMoved) {
      setTasks(newTasks);
      setFocusTaskId(taskId);
      syncStateWithBackend(newTasks)
    }
  };

  return (
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
        onNavigateFocus={handleFocusNavigation}
        onMoveTask={handleMoveTask}
        />
    ))}
    </ul>
  );
}

export default TodoApp;
