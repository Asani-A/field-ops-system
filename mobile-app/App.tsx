import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from './src/lib/firebase'; // <--- Import auth
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // App State
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1. MONITOR AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 2. MONITOR TASKS (Only if logged in)
  useEffect(() => {
    if (!user) return;
    
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

  const handleComplete = async (id: string) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { status: 'COMPLETED' });
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert("Login Error: " + err.message);
    }
  };

  // --- RENDER LOGIN ---
  if (!user) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.loginBox}>
          <Text style={styles.header}>🔐 Tech Login</Text>
          <TextInput 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput 
            placeholder="Password" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- RENDER DASHBOARD ---
  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'COMPLETED' ? '#d4edda' : '#fff3cd' }]}>
          <Text style={{ color: item.status === 'COMPLETED' ? '#155724' : '#856404', fontSize: 12, fontWeight: 'bold' }}>{item.status}</Text>
        </View>
      </View>
      {item.status !== 'COMPLETED' && (
        <TouchableOpacity style={styles.button} onPress={() => handleComplete(item.id)}>
          <Text style={styles.buttonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <Text style={styles.header}>📱 Technician View</Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={{color: 'red'}}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  loginBox: { padding: 20, justifyContent: 'center', flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', marginBottom: 20},
  input: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  list: { padding: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});
