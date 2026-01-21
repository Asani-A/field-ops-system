import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Task } from './types';
import './App.css'; // Standard Vite CSS

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 1. REAL-TIME LISTENER
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    
    // onSnapshot is the magic: it triggers EVERY time the database changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(liveData);
    });

    return () => unsubscribe();
  }, []);

  // 2. CREATE FUNCTION
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addDoc(collection(db, "tasks"), {
      title: newTaskTitle,
      status: 'PENDING',
      createdAt: Date.now()
    });

    setNewTaskTitle(''); // Clear input
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>🚁 Field Ops Dispatch</h1>
      
      {/* Input Form */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task for field team..."
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Dispatch</button>
      </form>

      {/* Live List */}
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} style={{ 
            border: '1px solid #ccc', 
            padding: '1rem', 
            marginBottom: '10px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <strong>{task.title}</strong>
            <span style={{ 
              backgroundColor: task.status === 'COMPLETED' ? '#d4edda' : '#fff3cd',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
