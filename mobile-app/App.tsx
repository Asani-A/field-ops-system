import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { db } from './src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

// Define the shape of our data
interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1. REAL-TIME LISTENER (Same logic as Web!)
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(liveData);
    });

    return () => unsubscribe();
  }, []);

  // 2. UPDATE FUNCTION (Mark as Complete)
  const handleComplete = async (id: string) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, {
      status: 'COMPLETED'
    });
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[
          styles.badge, 
          { backgroundColor: item.status === 'COMPLETED' ? '#d4edda' : '#fff3cd' }
        ]}>
          <Text style={{ 
            color: item.status === 'COMPLETED' ? '#155724' : '#856404',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.status !== 'COMPLETED' && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleComplete(item.id)}
        >
          <Text style={styles.buttonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>📱 Technician View</Text>
      
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50, // Avoid notch
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
