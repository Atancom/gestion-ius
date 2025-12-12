import React from 'react';
import { Project, Task, Risk } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, tasks, risks }) => {
  
  // Stats Calculation
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;
  
  const activeRisks = risks.filter(r => r.status === 'Open' || r.status === 'In Progress').length;
  const highImpactRisks = risks.filter(r => r.impact === 'High' && (r.status === 'Open' || r.status === 'In Progress')).length;

  // Chart Data
  const statusData = [
    { name: 'Completado', value: completedProjects, color: 'var(--color-emerald-500)' },
    { name: 'En Progreso', value: inProgressProjects, color: 'var(--color-blue-500)' },

    { name: 'Por Iniciar', value: projects.filter(p => p.status === 'Ready to Start').length, color: 'var(--color-slate-400)' },
  ].filter(d => d.value > 0);

  const tasksByProject = projects.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    total: tasks.filter(t => t.projectId === p.id).length,
    completed: tasks.filter(t => t.projectId === p.id && t.status === 'Completed').length
  })).slice(0, 5); // Top 5 projects

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="glass-panel rounded-2xl p-6 flex items-start justify-between relative overflow-hidden group">
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150", colorClass.replace('text-', 'bg-'))} />
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
      </div>
      <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard General</h2>
        <p className="text-muted-foreground mt-1">Visión estratégica del estado actual de la línea.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Proyectos Activos" 
          value={inProgressProjects} 
          subtext={`${totalProjects} totales`}
          icon={Target}
          colorClass="text-blue-600"
        />
        <StatCard 
          title="Tareas Pendientes" 
          value={totalTasks - completedTasks} 
          subtext={`${highPriorityTasks} alta prioridad`}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
        />
        <StatCard 
          title="Riesgos Activos" 
          value={activeRisks} 
          subtext={`${highImpactRisks} impacto alto`}
          icon={AlertTriangle}
          colorClass="text-amber-600"
        />
        <StatCard 
          title="Eficiencia Global" 
          value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`} 
          subtext="Tasa de completitud"
          icon={Activity}
          colorClass="text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Project Status Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estado de Proyectos
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Task Progress Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Progreso por Proyecto (Top 5)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByProject} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    cursor={{ fill: 'var(--accent)' }}
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="completed" name="Completadas" stackId="a" fill="var(--color-emerald-500)" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="total" name="Total Tareas" stackId="a" fill="var(--muted)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity / Critical Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Proyectos en Progreso</h3>
            <div className="space-y-4">
                {projects.filter(p => p.status === 'In Progress').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No hay proyectos en curso actualmente.</p>
                    </div>
                ) : (
                    projects.filter(p => p.status === 'In Progress').slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <div>
                                <h4 className="font-medium text-foreground">{p.name}</h4>
                                <p className="text-sm text-muted-foreground">Responsable: {p.assignee}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                                    En Progreso
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">Progreso: {p.progress}%</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Riesgos de Alto Impacto</h3>
            <div className="space-y-3">
                {highImpactRisks === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay riesgos críticos activos.</p>
                ) : (
                    risks.filter(r => r.impact === 'High' && r.status !== 'Closed').slice(0, 3).map(r => (
                        <div key={r.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground line-clamp-2">{r.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
