import React from 'react';
import { useRef, useEffect } from 'react';
import { getCursorPosition, setCursorPosition } from './utilities';

// tutorial calls this a "prop" object
export default function TaskItem({ task, onTextChange, onToggle, onDelete, onAddTask, onFocusHandled, focusTaskId, onIndentChange }) {

    const textInputRef = useRef(null);
    const cursorPosition = useRef(null);

    useEffect(() => {
        if (textInputRef.current && task.id === focusTaskId) {
            textInputRef.current.focus();

            setCursorPosition(textInputRef.current,textInputRef.current.textContent.length);
            onFocusHandled();
        }
    }, [focusTaskId, task.id, onFocusHandled]);

    useEffect(() => {
        if (textInputRef.current && cursorPosition.current !== null && document.activeElement === textInputRef.current) {
            setCursorPosition(textInputRef.current, cursorPosition.current);
            cursorPosition.current = null;
        }
    }, [task.text]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAddTask(task.id);
        }
        else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                onIndentChange(task.id, 'unindent');
            } else {
                onIndentChange(task.id, 'indent');
            }
        }
    };

    const handleInput = (e) => {
        cursorPosition.current = getCursorPosition(e.currentTarget);
        onTextChange(task.id, e.currentTarget.textContent);
    };

    return (
        <li>
            <div className="task-content">
                <span className="task-checkbox" onClick={() => onToggle(task.id)}>
                    {task.completed ? '[x]' : '[ ]'}
                </span>
                <div className="task-text" contentEditable="true" onKeyDown={handleKeyDown} onInput={handleInput} suppressContentEditableWarning={true} ref={textInputRef}>
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
                            onTextChange={onTextChange}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onAddTask={onAddTask}
                            onIndentChange={onIndentChange}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}