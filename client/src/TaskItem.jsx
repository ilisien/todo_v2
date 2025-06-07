import React from 'react';
import { useRef, useEffect } from 'react';

// tutorial calls this a "prop" object
export default function TaskItem({ task, onToggle, onDelete, onAddTask, onFocusHandled, focusTaskId }) {

    const textInputRef = useRef(null);

    useEffect(() => {
        if (textInputRef.current && task.id === focusTaskId) {
            textInputRef.current.focus();

            onFocusHandled();
        }
    }, [focusTaskId, task.id, onFocusHandled]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAddTask(task.id);
        }
    }

    return (
        <li>
            <div className="task-content">
                <span className="task-checkbox" onClick={() => onToggle(task.id)}>
                    {task.completed ? '[x]' : '[ ]'}
                </span>
                <div className="task-text" contentEditable="true" onKeyDown={handleKeyDown} suppressContentEditableWarning={true} ref={textInputRef}>
                    {task.text}
                </div>
                <span className="task-delete" onClick={() => onDelete(task.id)}>x</span>
            </div>
            {task.children && task.children.length > 0 && (
                <ul>
                    {task.children.map(childTask => (
                        <TaskItem 
                            key={childTask.id}
                            task={childTask}
                            focusTaskId={focusTaskId}
                            onFocusHandled={onFocusHandled}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onAddTask={onAddTask}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}