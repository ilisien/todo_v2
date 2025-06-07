// tutorial calls this a "prop" object
export default function TaskItem({ task }) {
    return (
        <li>
            <div className="task-content">
                <span className="task-checkbox">
                    {task.completed ? '[x]' : '[ ]'}
                </span>
                <div className="task-text" contentEditable="true">
                    {task.text}
                </div>
                <span className="task-delete">x</span>
            </div>

            <ul>
                {task.children.map(childTask => (
                    <TaskItem key={childTask.id} task={childTask} />
                ))}
            </ul>
        </li>
    );
}