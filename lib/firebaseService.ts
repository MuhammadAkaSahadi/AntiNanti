import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Task } from "@/types";

/**
 * Update user profile in Firestore
 */
export async function saveUserProfile(uid: string, profile: User): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    partnerEmail: profile.partnerEmail || "",
  }, { merge: true });
}

/**
 * Set up a real-time listener for tasks belonging to a specific user
 */
export function listenToTasks(userId: string, callback: (tasks: Task[]) => void) {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef, 
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasksList: Task[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tasksList.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        deadline: data.deadline,
        status: data.status,
        microTasks: data.microTasks || [],
      });
    });
    // Optional client-side sort to put newest first
    tasksList.sort((a, b) => (b.id && a.id ? b.id.localeCompare(a.id) : 0));
    callback(tasksList);
  }, (error) => {
    console.error("Error listening to Firestore tasks:", error);
  });
}

/**
 * Add a new task to Firestore
 */
export async function addTaskToDB(task: Omit<Task, "id">): Promise<string> {
  const tasksRef = collection(db, "tasks");
  const docRef = await addDoc(tasksRef, task);
  return docRef.id;
}

/**
 * Update task status or its microtasks in Firestore
 */
export async function updateTaskInDB(taskId: string, taskData: Partial<Task>): Promise<void> {
  const taskDocRef = doc(db, "tasks", taskId);
  await updateDoc(taskDocRef, taskData);
}

/**
 * Save AI Logs to maintain daily contextual history
 */
export async function saveAILogToDB(userId: string, type: "briefing" | "negotiation" | "chat", content: string): Promise<void> {
  const logsRef = collection(db, "ai_logs");
  await addDoc(logsRef, {
    userId,
    type,
    content,
    createdAt: new Date().toISOString(),
  });
}
