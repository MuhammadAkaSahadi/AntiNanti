"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, AlertCircle, RefreshCw, Send, Mail } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { Task, MicroTask, User } from "@/types";

// Import Modular Dashboard Components
import { BriefingCard } from "@/components/dashboard/briefing-card";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { TaskCard } from "@/components/dashboard/task-card";
import { NegotiationDialog } from "@/components/dashboard/negotiation-dialog";
import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { AIOptimizerChat } from "@/components/dashboard/ai-optimizer-chat";
import { SettingsForm } from "@/components/dashboard/settings-form";

// Import Firestore Services
import { 
  saveUserProfile, 
  listenToTasks, 
  addTaskToDB, 
  updateTaskInDB, 
  saveAILogToDB 
} from "@/lib/firebaseService";

export default function Dashboard() {
  const { user, dbUser, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [currentTab, setCurrentTab] = useState("home");
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Redirect to Landing page if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Real-time Firestore Tasks Sync
  useEffect(() => {
    if (user) {
      const unsubscribe = listenToTasks(user.uid, (tasksList) => {
        setTasks(tasksList);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // AI Briefing State
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [briefingData, setBriefingData] = useState({
    cuaca: "Jember - Memuat...",
    laluLintas: "Lalu lintas - Memuat...",
    saranAI: "Klik tombol segarkan di samping untuk memicu AI Morning Briefing beralaskan pencarian internet real-time (cuaca & kemacetan Jember/UNEJ) dan jadwal tugas Anda.",
  });

  const handleRefreshBriefing = async () => {
    if (!user) return;
    setIsBriefingLoading(true);
    try {
      const res = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const payload = result.data;
        setBriefingData({
          cuaca: "Jember - Real-time Search Grounded",
          laluLintas: "Lalu lintas UNEJ - Terpantau Google Search",
          saranAI: payload.pesan_utama,
        });
        showToast("Briefing pagi diperbarui via Gemini Search Grounding!", "success");
        await saveAILogToDB(user.uid, "briefing", JSON.stringify(payload));
      } else {
        throw new Error(result.error || "Gagal mendapatkan briefing");
      }
    } catch (error: any) {
      console.error(error);
      showToast("Gagal mengambil AI briefing harian.", "error");
    } finally {
      setIsBriefingLoading(false);
    }
  };

  // State to manage task AI negotiation dialog
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [negotiatedMicroTasks, setNegotiatedMicroTasks] = useState<MicroTask[]>([]);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationRound, setNegotiationRound] = useState(0);
  const [aiMessage, setAiMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const startNegotiation = async (task: Task) => {
    setActiveTask(task);
    setNegotiatedMicroTasks([...task.microTasks]);
    setNegotiationRound(0);
    setIsDialogOpen(true);
    setIsNegotiating(true);
    setAiMessage("AI sedang merancang pecahan tugas optimal...");

    try {
      const res = await fetch("/api/ai/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          microTasks: task.microTasks,
          negotiationRound: 0,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAiMessage(result.data.pesan_utama);
        if (result.data.strategi_tugas && result.data.strategi_tugas.length > 0) {
          // Map to match MicroTask structure if needed
          const updated = result.data.strategi_tugas.map((mt: any) => ({
            id: mt.id || `mt-${Date.now()}-${Math.random()}`,
            title: mt.title || mt.nama_tugas_kecil,
            duration: mt.duration || mt.durasi_menit,
            urgency: (mt.urgency || mt.tingkat_urgency || "medium").toLowerCase(),
            status: mt.status || "pending",
          }));
          setNegotiatedMicroTasks(updated);
        }
      }
    } catch (error) {
      console.error(error);
      setAiMessage("Gagal merancang pecahan tugas. Coba kembali.");
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleAskForMoreTime = async () => {
    if (!activeTask) return;
    setIsNegotiating(true);
    const nextRound = negotiationRound + 1;
    setNegotiationRound(nextRound);

    try {
      const res = await fetch("/api/ai/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: activeTask.title,
          microTasks: negotiatedMicroTasks,
          requestExtension: true,
          negotiationRound: nextRound,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAiMessage(result.data.pesan_utama);
        if (result.data.strategi_tugas) {
          const updated = result.data.strategi_tugas.map((mt: any) => ({
            id: mt.id || `mt-${Date.now()}`,
            title: mt.title || mt.nama_tugas_kecil,
            duration: mt.duration || mt.durasi_menit,
            urgency: (mt.urgency || mt.tingkat_urgency || "medium").toLowerCase(),
            status: mt.status || "pending",
          }));
          setNegotiatedMicroTasks(updated);
        }
        showToast("AI menyesuaikan estimasi waktu pengerjaan.", "info");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal melakukan negosiasi ulang waktu.", "error");
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleAcceptCommitment = async () => {
    if (!activeTask || !user) return;
    
    try {
      const updatedMicroTasks = negotiatedMicroTasks.map((mt) =>
        mt.status === "pending" ? { ...mt, status: "progress" as const } : mt
      );

      await updateTaskInDB(activeTask.id || "", {
        status: "progress",
        microTasks: updatedMicroTasks,
      });

      setIsDialogOpen(false);
      showToast("Komitmen disetujui! Sanksi email aktif jika melanggar waktu.", "success");
      await saveAILogToDB(user.uid, "negotiation", `Komitmen disetujui untuk tugas: ${activeTask.title}`);
    } catch (error) {
      console.error(error);
      showToast("Gagal menyimpan komitmen tugas.", "error");
    }
  };

  // Toggle Microtask Completion directly updating to Firestore
  const toggleMicroTaskStatus = async (taskId: string, microTaskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedMicro = targetTask.microTasks.map((mt) => {
      if (mt.id === microTaskId) {
        const newStatus = mt.status === "completed" ? "pending" as const : "completed" as const;
        return { ...mt, status: newStatus };
      }
      return mt;
    });
    
    const allCompleted = updatedMicro.every((mt) => mt.status === "completed");
    const anyInProgress = updatedMicro.some((mt) => mt.status === "completed" || mt.status === "progress");
    
    let taskStatus: "pending" | "progress" | "completed" = "pending";
    if (allCompleted) taskStatus = "completed";
    else if (anyInProgress) taskStatus = "progress";

    try {
      await updateTaskInDB(taskId, {
        status: taskStatus,
        microTasks: updatedMicro,
      });
      showToast("Progress sub-tugas berhasil disinkronkan ke Firestore!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui status sub-tugas.", "error");
    }
  };

  // Manual trigger to simulate email penalty dispatch
  const handleSimulateEmailPenalty = async (task: Task) => {
    if (!user || !dbUser) return;
    if (!dbUser.partnerEmail) {
      showToast("Silakan daftarkan email rekan Anda di menu Pengaturan terlebih dahulu!", "error");
      return;
    }

    try {
      showToast("Mengirim laporan kegagalan disiplin via Resend API...", "info");
      const res = await fetch("/api/email/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: dbUser.displayName,
          email: dbUser.email,
          partnerEmail: dbUser.partnerEmail,
          taskTitle: task.title,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("Email penalti sosial dikirim ke partner akuntabilitas!", "success");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error(error);
      showToast("Gagal mengirim notifikasi email sanksi.", "error");
    }
  };

  // Progress Calculation
  const totalMicroTasks = tasks.reduce((sum, t) => sum + t.microTasks.length, 0);
  const completedMicroTasks = tasks.reduce(
    (sum, t) => sum + (t.microTasks || []).filter((mt) => mt.status === "completed").length,
    0
  );
  const overallProgress = totalMicroTasks > 0 ? Math.round((completedMicroTasks / totalMicroTasks) * 100) : 0;

  // Settings Save Profile Function
  const handleSaveSettings = async (data: User) => {
    if (!user) return;
    try {
      await saveUserProfile(user.uid, data);
      showToast("Profil & Partner Akuntabilitas disimpan ke Firestore!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menyimpan pengaturan profil.", "error");
    }
  };

  // Chat State Simulation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "Halo! Saya asisten proaktif AntiNanti. Saya melihat Anda memiliki tugas di Firestore. Jika Anda memiliki alasan menunda, silakan ketik di sini agar saya bantu memecah bebannya.",
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    const newUserMessage = { sender: "user" as const, text };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatMessages,
        }),
      });
      const result = await res.json();
      if (result.success && result.data?.reply) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: result.data.reply }]);
        if (user) {
          await saveAILogToDB(user.uid, "chat", `User: ${text} | AI: ${result.data.reply}`);
        }
      } else {
        throw new Error(result.error || "Gagal menghubungi AI");
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: "Maaf, koneksi otak saya sedang terganggu. Mari diskusikan alasan Anda sekali lagi!" 
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // New Task Creation Handler
  const handleAddTask = async (title: string, deadline: string) => {
    if (!user) return;
    
    const createdTask: Omit<Task, "id"> = {
      userId: user.uid,
      title,
      deadline,
      status: "pending",
      microTasks: [
        {
          id: `mt-${Date.now()}-1`,
          title: "Pecahan Awal: Analisis Persiapan",
          duration: 15,
          urgency: "medium",
          status: "pending",
        },
        {
          id: `mt-${Date.now()}-2`,
          title: "Pecahan Inti: Draft Pembahasan",
          duration: 30,
          urgency: "high",
          status: "pending",
        }
      ]
    };

    try {
      await addTaskToDB(createdTask);
      showToast("Tugas utama disimpan ke Firestore! Silakan lakukan negosiasi.", "success");
      setCurrentTab("home");
    } catch (error) {
      console.error(error);
      showToast("Gagal menyimpan tugas baru ke Firestore.", "error");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent"></div>
          <span className="text-sm font-semibold text-stone-500">Memproses autentikasi...</span>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-3 shadow-lg transition-all duration-300 border border-emerald-700 animate-slide-in">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Navigation Layout */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 md:pl-72 md:pr-8 md:py-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
        
        {/* TAB 1: DASHBOARD UTAMA */}
        {currentTab === "home" && (
          <div className="flex flex-col gap-6">
            
            {/* WIDGET 1: CONTEXTUAL MORNING BRIEFING CARD */}
            <BriefingCard 
              isBriefingLoading={isBriefingLoading} 
              briefingData={briefingData} 
              onRefresh={handleRefreshBriefing} 
            />

            {/* WIDGET 2: PROGRESS TRACKER */}
            <ProgressTracker 
              completedMicroTasks={completedMicroTasks}
              totalMicroTasks={totalMicroTasks}
              overallProgress={overallProgress}
            />

            {/* WIDGET 3: DYNAMIC TASK NEGOTIATION LIST */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">Daftar Komitmen Tugas</h2>
                <button
                  onClick={() => setCurrentTab("tasks")}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400"
                >
                  <Plus className="h-3 w-3" /> Tambah Tugas
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="border border-dashed p-8 text-center text-stone-400 rounded-2xl bg-white dark:bg-stone-950 dark:border-stone-850">
                  <p className="text-sm">Belum ada tugas hari ini. Mulai dengan membuat tugas baru!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="relative group">
                    <TaskCard 
                      task={task} 
                      onToggleMicroTask={toggleMicroTaskStatus}
                      onStartNegotiation={startNegotiation}
                    />
                    
                    {/* Manual trigger for Resend email validation */}
                    {task.status !== "completed" && (
                      <button
                        onClick={() => handleSimulateEmailPenalty(task)}
                        className="absolute right-40 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3 py-1.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 shadow-sm"
                        title="Simulasikan pelanggaran waktu tugas ini ke partner"
                      >
                        <Mail className="h-3 w-3" /> Penalti
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DIALOG NEGOSIASI AI */}
            <NegotiationDialog 
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              activeTask={activeTask}
              negotiatedMicroTasks={negotiatedMicroTasks}
              setNegotiatedMicroTasks={setNegotiatedMicroTasks}
              aiMessage={aiMessage}
              isNegotiating={isNegotiating}
              negotiationRound={negotiationRound}
              partnerEmail={dbUser.partnerEmail || "Belum didaftarkan"}
              onAskForMoreTime={handleAskForMoreTime}
              onAcceptCommitment={handleAcceptCommitment}
            />

          </div>
        )}

        {/* TAB 2: MANAJEMEN TUGAS */}
        {currentTab === "tasks" && (
          <div className="flex flex-col gap-6">
            <NewTaskForm onAddTask={handleAddTask} />

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-stone-500 uppercase px-1">Tugas Terdaftar ({tasks.length})</h3>
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-4 rounded-xl bg-white border border-stone-200 shadow-sm dark:bg-stone-950 dark:border-stone-800">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">{task.title}</h4>
                    <span className="text-[11px] text-stone-400">Deadline: {task.deadline}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    {task.microTasks.length} Pecahan
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI CHAT (NEGOTIATOR) */}
        {currentTab === "chat" && (
          <AIOptimizerChat 
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            isAiTyping={isAiTyping}
          />
        )}

        {/* TAB 4: SETTINGS */}
        {currentTab === "settings" && (
          <SettingsForm 
            userProfile={dbUser}
            onSaveSettings={handleSaveSettings}
          />
        )}

      </main>
    </div>
  );
}
