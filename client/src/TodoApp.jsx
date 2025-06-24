import { useState, useEffect, useRef } from 'react';
import './App.css';
import TaskItem from './TaskItem.jsx';
import debounce from 'lodash/debounce';
import axios from './axiosInstance.js';

function TodoApp({ token }) {
  const [tasks, setTasks] = useState([]);

  const createBlankTask = () => ({
      id: Date.now(),
      text: "",
      completed: false,
      children: [],
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks', {
        headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`},
    })
      .then(res => {
        const data = res.data;
        // Check if the data from the server is empty or null
        if (data && Array.isArray(data) && data.length > 0) {
          // If we have data, just set it as normal.
          setTasks(data);
        } else {
          const blankTask = createBlankTask();
          setTasks([blankTask]);
          setFocusTaskId(blankTask.id);
        }
      })
      .catch(error => {
        console.error("Error fetching blob:", error);
        // It's also good practice to handle fetch errors by creating a default task
        // so the app is still usable even if the backend is down on first load.
        const blankTask = createBlankTask();
        setTasks([blankTask]);
        setFocusTaskId(blankTask.id);
      });
  }, [token]);

  const [focusTaskId, setFocusTaskId] = useState(null);

  const syncStateWithBackend = (newState) => {
    axios.post('http://localhost:5000/api/tasks', newState, {
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`}
    });
  };

  const debouncedSyncStateWithBackend = debounce(syncStateWithBackend,400);

  const patchTaskToBackend = async (taskId, partialUpdate, token) => {
    await axios.patch('http://localhost:5000/api/tasks', { id: taskId, ...partialUpdate }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
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

  const updateTaskInTreeAndReturn = (nodes, taskId, updateFn) => {
    let changedNode = null; // This will store the updated node if found

    const updatedTree = nodes.map(node => {
        // If this is the node we're looking for
        if (node.id === taskId) {
        const updated = updateFn(node);
        changedNode = updated; // Capture the updated node
        return updated;
        }

        // If this node has children, recurse into them
        if (node.children && node.children.length > 0) {
        const { updatedTree: updatedChildren, changedNode: childChangedNode } =
            updateTaskInTreeAndReturn(node.children, taskId, updateFn);

        // If the changed node was found in the children, propagate it up
        if (childChangedNode) {
            changedNode = childChangedNode;
        }
        // Return a new node object with updated children
        return { ...node, children: updatedChildren };
        }

        // If no match and no children to recurse, return the node as is
        return node;
    });

    // Return both the new tree and the changed node
    return { updatedTree, changedNode };
  };

  const handleTextChange = (taskId, newText) => {
    const {updatedTree: newTasks, changedNode: task} = updateTaskInTreeAndReturn(tasks, taskId, (task) => ({
      ...task,
      text: newText,
    }));
    setTasks(newTasks);
    patchTaskToBackend(taskId, { text: newText }, token);
  }

  const handleToggleComplete = (taskId) => {
    const {updatedTree: newTasks, changedNode: task} = updateTaskInTreeAndReturn(tasks, taskId, (task) => ({
      ...task,
      completed: !task.completed,
    }));
    setTasks(newTasks);
    patchTaskToBackend(taskId, { completed: task.completed }, token);
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
    if (newTasks.length == 0) {
      const blankTask = createBlankTask();
      setTasks([blankTask]);
      setFocusTaskId(blankTask.id);
    } else {
      setTasks(newTasks);
      syncStateWithBackend(newTasks);
    };
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
    } else if (direction === 'down') {
      nextIndex = currentIndex + 1;
    } else if (direction === 'prefer up') {
      if (currentIndex == 0) {
        nextIndex = currentIndex + 1;
      } else {
        nextIndex = currentIndex - 1;
      }
    } else if (direction === 'prefer down') {
      if (currentIndex == (orderedIds.length - 1)) {
        nextIndex = currentIndex - 1;
      } else {
        nextIndex = currentIndex + 1;
      }
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
