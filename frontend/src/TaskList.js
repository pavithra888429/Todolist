import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Optional: if you have styles

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch tasks
  const fetchTasks = () => {
    axios.get('http://localhost:8000/api/tasks/')
      .then(res => setTasks(res.data))
      .catch(err => console.error("GET error:", err));
  };

  useEffect(() => { fetchTasks(); }, []);

  // Create task
  const addTask = () => {
    if (!newTitle.trim()) return;
    axios.post('http://localhost:8000/api/tasks/', {
      title: newTitle,
      completed: false
    }).then(res => {
      setTasks([...tasks, res.data]);
      setNewTitle('');
    }).catch(err => console.error("POST error:", err));
  };

  // Toggle completed
  const toggleComplete = (task) => {
    axios.put(`http://localhost:8000/api/tasks/${task._id}/`, {
      title: task.title,
      completed: !task.completed
    }).then(res => {
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    }).catch(err => console.error("PUT error (toggle):", err));
  };

  // Delete task
  const deleteTask = (id) => {
    axios.delete(`http://localhost:8000/api/tasks/${id}/`)
      .then(() => setTasks(tasks.filter(t => t._id !== id)))
      .catch(err => console.error("DELETE error:", err));
  };

  // Save updated task
  const updateTask = (task) => {
    if (!editTitle.trim()) return;
    axios.put(`http://localhost:8000/api/tasks/${task._id}/`, {
      title: editTitle,
      completed: task.completed
    }).then(res => {
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
      setEditId(null);
      setEditTitle('');
    }).catch(err => console.error("PUT error (update):", err));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditTitle('');
  };

  return (
    <div className="container">
      <h2>📝 To-Do List</h2>
      <div className="input-group">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New task"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task._id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
            />
            {editId === task._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
                <button onClick={() => updateTask(task)}>Update</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                <button onClick={() => { setEditId(task._id); setEditTitle(task.title); }}>✏️</button>
                <button onClick={() => deleteTask(task._id)}>❌</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
