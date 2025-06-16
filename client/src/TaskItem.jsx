import React from 'react';
import { useRef, useEffect } from 'react';
import { getCursorPosition, setCursorPosition } from './utilities';

// tutorial calls this a "prop" object
export default function TaskItem({ task, onTextChange, onToggle, onDelete, onAddTask, onFocusHandled, focusTaskId, onIndentChange, onNavigateFocus, onMoveTask }) {

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
        if (e.ctrlKey) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                onMoveTask(task.id,'up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                onMoveTask(task.id, 'down');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            onNavigateFocus(task.id, 'up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onNavigateFocus(task.id, 'down');
        } else if (e.key === 'Enter') {
            if (e.shiftKey) {
                // (do nothing)
            } else {
                e.preventDefault();
                onAddTask(task.id);
            }
        } else if (e.key === 'Tab') {
            if (e.shiftKey) {
                e.preventDefault();
                onIndentChange(task.id, 'unindent');
            } else {
                e.preventDefault();
                onIndentChange(task.id, 'indent');
            }
        } else if (e.key === 'Delete') {
            if (e.shiftKey) {
                e.preventDefault();
                onNavigateFocus(task.id,'up')
                onDelete(task.id)
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
                            onNavigateFocus={onNavigateFocus}
                            onMoveTask={onMoveTask}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}