import React from 'react';
// tutorial calls this a "prop" object
export default function TaskItem({ task, onToggle, onDelete }) {
    return (
        <li>
            <div className="task-content">
                <span className="task-checkbox" onClick={() => onToggle(task.id)}>
                    {task.completed ? '[x]' : '[ ]'}
                </span>
                <div className="task-text" contentEditable="true">
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
                            onToggle={onToggle}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}