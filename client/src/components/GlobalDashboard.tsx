import React from 'react';
import { WorkLine, Project, Task, Risk } from '../types';
import { Activity, Briefcase, HeartPulse, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalDashboardProps {
  lines: WorkLine[];
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ lines, projects, tasks, risks }) => {
  
  // --- KPI Calculations ---
  const activeLines = lines.length;
  const totalProjects = projects.length;
  
  // Global Health: Average progress of all active projects
  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const globalHealth = activeProjects.length > 0 
    ? Math.round(activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length) 
    : 100;

  // Critical Risks: High priority risks that are open
  const criticalRisks = risks.filter(r => r.priority === 'High' && (r.status === 'Open' || r.status === 'In Progress')).length;

  // --- Chart Data Preparation ---
  // Projects per Line
  const lineStats = lines.map(line => {
    const lineProjects = projects.filter(p => p.lineId === line.id);
    const lineRisks = risks.filter(r => r.lineId === line.id && (r.status === 'Open' || r.status === 'In Progress'));
    const avgProgress = lineProjects.length > 0 
        ? Math.round(lineProjects.reduce((acc, p) => acc + p.progress, 0) / lineProjects.length) 
        : 0;
    
    return {
        id: line.id,
        name: line.name,
        projectCount: lineProjects.length,
        riskCount: lineRisks.length,
        health: avgProgress
    };
  });

  // Risk Distribution
  const highRisks = risks.filter(r => r.priority === 'High').length;
  const mediumRisks = risks.filter(r => r.priority === 'Medium').length;
  const lowRisks = risks.filter(r => r.priority === 'Low').length;
  const totalRisks = highRisks + mediumRisks + lowRisks;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Global</h2>
        <p className="text-muted-foreground mt-1">Visión estratégica consolidada de todas las líneas de negocio.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Lines */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Líneas Activas</p>
                <h3 className="text-3xl font-bold text-foreground">{activeLines}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Briefcase className="h-6 w-6" />
            </div>
        </div>

        {/* Total Projects */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Proyectos Totales</p>
                <h3 className="text-3xl font-bold text-foreground">{totalProjects}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Activity className="h-6 w-6" />
            </div>
        </div>

        {/* Global Health */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Salud Global</p>
                <h3 className={cn("text-3xl font-bold", globalHealth >= 80 ? "text-emerald-600" : globalHealth >= 50 ? "text-amber-600" : "text-rose-600")}>
                    {globalHealth}%
                </h3>
            </div>
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", globalHealth >= 80 ? "bg-emerald-500/10 text-emerald-600" : globalHealth >= 50 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600")}>
                <HeartPulse className="h-6 w-6" />
            </div>
        </div>

        {/* Critical Risks */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Riesgos Críticos</p>
                <h3 className="text-3xl font-bold text-rose-600">{criticalRisks}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-6 w-6" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Comparative Chart (Bar Chart Simulation) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-bold text-foreground">Carga de Trabajo por Línea</h3>
            </div>
            
            <div className="space-y-6">
                {lineStats.map(line => (
                    <div key={line.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">{line.name}</span>
                            <span className="text-muted-foreground">{line.projectCount} Proyectos</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                            <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ width: `${Math.max(5, (line.projectCount / (Math.max(...lineStats.map(l => l.projectCount)) || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Risk Map (Pie Chart Simulation) */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-bold text-foreground">Mapa de Riesgos</h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                {/* Visual Circle Representation */}
                <div className="relative w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center">
                    <div className="text-center">
                        <span className="block text-4xl font-bold text-foreground">{totalRisks}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                    </div>
                    {/* Colored segments would be here in a real chart library */}
                </div>

                {/* Legend */}
                <div className="w-full space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Alta Prioridad</span>
                        </div>
                        <span className="font-bold text-rose-700 dark:text-rose-400">{highRisks}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Media Prioridad</span>
                        </div>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{mediumRisks}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Baja Prioridad</span>
                        </div>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{lowRisks}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Health Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-bold text-foreground">Estado de Salud por Línea</h3>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                        <th className="px-6 py-4">Línea de Trabajo</th>
                        <th className="px-6 py-4">Proyectos Activos</th>
                        <th className="px-6 py-4">Riesgos Abiertos</th>
                        <th className="px-6 py-4">Salud General</th>
                        <th className="px-6 py-4 text-right">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {lineStats.map(line => (
                        <tr key={line.id} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{line.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">{line.projectCount}</td>
                            <td className="px-6 py-4 text-muted-foreground">{line.riskCount}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-24">
                                        <div 
                                            className={cn("h-full rounded-full", line.health >= 80 ? "bg-emerald-500" : line.health >= 50 ? "bg-amber-500" : "bg-rose-500")}
                                            style={{ width: `${line.health}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{line.health}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    line.health >= 80 
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                        : line.health >= 50 
                                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                )}>
                                    {line.health >= 80 ? "Óptimo" : line.health >= 50 ? "Regular" : "Crítico"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};
