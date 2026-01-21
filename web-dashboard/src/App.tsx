import { useEffect, useState } from 'react';
import { db, auth } from './lib/firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Task } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 1. MONITOR AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. MONITOR TASKS (Only if logged in)
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in

    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(liveData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Login failed: " + err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title: newTaskTitle,
      status: 'PENDING',
      createdAt: Date.now()
    });
    setNewTaskTitle('');
  };

  if (loading) return <div>Loading...</div>;

  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>🔐 HQ Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ padding: '8px' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ padding: '8px' }}
          />
          {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" style={{ padding: '10px' }}>Sign In</button>
        </form>
        <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
          (Create a user in Firebase Console or use: admin@hq.com / 123456)
        </p>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🚁 Field Ops Dispatch</h1>
        <button onClick={() => signOut(auth)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Sign Out</button>
      </div>
      
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
