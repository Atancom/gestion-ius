import React, { useState, useEffect } from 'react';
import { LineSelector } from './components/LineSelector';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Risks } from './components/Risks';
import { Timeline } from './components/Timeline';
import { MonthlyReviewView } from './components/MonthlyReview';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { WorkLine, Project, Task, Risk, ViewState, User } from './types';
import { Menu, LogOut, ArrowLeft, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const App: React.FC = () => {
  // Theme State
  const [isDark, setIsDark] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('theme') === 'dark' || 
                 (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      return false;
  });

  useEffect(() => {
      if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [isDark]);

  // Data State
  const [lines, setLines] = useState<WorkLine[]>(() => {
    const saved = localStorage.getItem('iustime_lines');
    return saved ? JSON.parse(saved) : [{ id: 'line-1', name: 'Línea General', description: 'Línea por defecto', createdAt: new Date().toISOString() }];
  });
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('iustime_projects') || '[]'));
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('iustime_tasks') || '[]'));
  const [risks, setRisks] = useState<Risk[]>(() => JSON.parse(localStorage.getItem('iustime_risks') || '[]'));
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('iustime_users') || JSON.stringify([
    { id: 'admin', name: 'Admin', email: 'admin@iustime.com', password: 'admin', role: 'ADMIN' },
    { id: 'ana', name: 'Ana Tanco', email: 'ana.tanco@solfico.es', password: 'An@t4505', role: 'ADMIN' }
  ])));

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.PROJECTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminViewLineId, setAdminViewLineId] = useState<string>('');

  // Persistence
  useEffect(() => localStorage.setItem('iustime_lines', JSON.stringify(lines)), [lines]);
  useEffect(() => localStorage.setItem('iustime_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('iustime_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('iustime_risks', JSON.stringify(risks)), [risks]);
  useEffect(() => localStorage.setItem('iustime_users', JSON.stringify(users)), [users]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'USER' && user.assignedLineId) {
        setSelectedLineId(user.assignedLineId);
        setCurrentView(ViewState.DASHBOARD);
    } else {
        setSelectedLineId(null);
        if (lines.length > 0) setAdminViewLineId(lines[0].id);
    }
  };

  const handleLogout = () => { setCurrentUser(null); setSelectedLineId(null); setSidebarOpen(false); };
  
  const recalculateProgress = (projectId: string, currentTasks: Task[]) => {
      const pTasks = currentTasks.filter(t => t.projectId === projectId && !t.parentId);
      if (pTasks.length === 0) return 0;
      return Math.round(pTasks.reduce((acc, t) => acc + t.progress, 0) / pTasks.length);
  };

  const handleAddTask = (t: Task) => {
      const newTasks = [...tasks, t];
      setTasks(newTasks);
      setProjects(projects.map(p => p.id === t.projectId ? { ...p, progress: recalculateProgress(p.id, newTasks) } : p));
  };

  const handleUpdateTask = (t: Task) => {
      const newTasks = tasks.map(tk => tk.id === t.id ? t : tk);
      setTasks(newTasks);
      setProjects(projects.map(p => p.id === t.projectId ? { ...p, progress: recalculateProgress(p.id, newTasks) } : p));
  };

  if (!currentUser) return <Login users={users} onLogin={handleLogin} />;

  const isGlobal = currentView === ViewState.GLOBAL_DASHBOARD || currentView === ViewState.GLOBAL_REVIEW || currentView === ViewState.CONFIGURATION;
  const activeLineId = isGlobal ? adminViewLineId : selectedLineId;
  const filteredProjects = projects.filter(p => p.lineId === activeLineId);
  const filteredTasks = tasks.filter(t => t.lineId === activeLineId);
  const filteredRisks = risks.filter(r => r.lineId === activeLineId);

  if (currentUser.role === 'ADMIN' && !selectedLineId && !isGlobal) {
      return <LineSelector lines={lines} onSelectLine={(id) => { setSelectedLineId(id); setCurrentView(ViewState.PROJECTS); }} onAddLine={(l) => setLines([...lines, l])} onDeleteLine={(id) => setLines(lines.filter(l => l.id !== id))} />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground font-sans">
        
        <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            onExitLine={() => { setSelectedLineId(null); setCurrentView(ViewState.PROJECTS); }} 
            onLogout={handleLogout} 
            lineName={lines.find(l => l.id === selectedLineId)?.name || 'Admin'} 
            isOpen={sidebarOpen} 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            userRole={currentUser.role} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            {/* Topbar */}
            <header className="h-16 flex items-center justify-between px-6 z-10 shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors">
                        <Menu className="h-6 w-6 text-muted-foreground" />
                    </button>
                    <div className="flex items-center gap-3">
                         {currentUser.role === 'ADMIN' && (selectedLineId || isGlobal) && (
                            <button 
                                onClick={() => { setSelectedLineId(null); setCurrentView(ViewState.PROJECTS); }} 
                                className="p-2 hover:bg-accent rounded-full transition-colors group"
                                title="Volver a selección de línea"
                            >
                                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                            </button>
                         )}
                         <h1 className="font-bold text-lg truncate bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            {selectedLineId 
                                ? (lines.find(l => l.id === selectedLineId)?.name) 
                                : isGlobal 
                                    ? (currentView === ViewState.CONFIGURATION ? 'Configuración' : 'Visión General Administrador') 
                                    : 'Gestión de Líneas Ius'}
                         </h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsDark(!isDark)} 
                        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                     >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                     </button>
                     
                     <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                            {currentUser.name.charAt(0)}
                        </div>
                     </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-7xl mx-auto w-full">
                    {currentView === ViewState.DASHBOARD && <Dashboard projects={filteredProjects} tasks={filteredTasks} risks={filteredRisks} />}
                    {currentView === ViewState.PROJECTS && <Projects projects={filteredProjects} lineId={activeLineId!} onAddProject={(p) => setProjects([...projects, p])} onUpdateProject={(p) => setProjects(projects.map(pr => pr.id === p.id ? p : pr))} onDeleteProject={(id) => setProjects(projects.filter(p => p.id !== id))} />}
                    {currentView === ViewState.TASKS && <Tasks tasks={filteredTasks} projects={filteredProjects} lineId={activeLineId!} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />}
                    {currentView === ViewState.TIMELINE && <Timeline tasks={filteredTasks} />}
                    {currentView === ViewState.RISKS && <Risks risks={filteredRisks} tasks={filteredTasks} lineId={activeLineId!} onAddRisk={(r) => setRisks([...risks, r])} onUpdateRisk={(r) => setRisks(risks.map(rk => rk.id === r.id ? r : rk))} onDeleteRisk={(id) => setRisks(risks.filter(r => r.id !== id))} />}
                    {currentView === ViewState.MONTHLY_REVIEW && <MonthlyReviewView lineId={activeLineId!} projects={filteredProjects} tasks={filteredTasks} risks={filteredRisks} />}
                    {currentView === ViewState.CONFIGURATION && <UserManagement users={users} lines={lines} onAddUser={(u) => setUsers([...users, u])} onUpdateUser={(u) => setUsers(users.map(us => us.id === u.id ? u : us))} onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))} />}
                </div>
            </main>
        </div>
    </div>
  );
};

export default App;
