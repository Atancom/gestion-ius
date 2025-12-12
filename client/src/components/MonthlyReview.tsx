import React, { useState, useEffect } from 'react';
import { Project, Task, Risk, MonthlyReview } from '../types';
import { generateMonthlyReview } from '../services/geminiService';
import { FileText, Sparkles, Download, Send, Loader2, Calendar, CheckCircle2, AlertCircle, BarChart3, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyReviewProps {
  lineId: string;
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

export const MonthlyReviewView: React.FC<MonthlyReviewProps> = ({ lineId, projects, tasks, risks }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [review, setReview] = useState<MonthlyReview | null>(null);
  
  // Metrics State
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    completedTasks: 0,
    delayedTasks: 0,
    openRisks: 0
  });

  // Calculate metrics when month or data changes
  useEffect(() => {
    if (!selectedMonth) return;

    const start = startOfMonth(parseISO(selectedMonth + '-01'));
    const end = endOfMonth(parseISO(selectedMonth + '-01'));

    // Filter tasks active in this month
    const monthTasks = tasks.filter(t => {
        const taskStart = parseISO(t.startDate);
        const taskEnd = parseISO(t.endDate);
        return (taskStart <= end && taskEnd >= start);
    });

    const active = monthTasks.filter(t => t.status !== 'Completed').length;
    const completed = monthTasks.filter(t => t.status === 'Completed').length;
    
    // Delayed logic: Active tasks past their end date (relative to today if month is current, or end of month if past)
    const delayed = monthTasks.filter(t => {
        const endDate = parseISO(t.endDate);
        const now = new Date();
        const checkDate = isWithinInterval(now, { start, end }) ? now : end;
        return t.status !== 'Completed' && endDate < checkDate;
    }).length;

    const openRisksCount = risks.filter(r => r.status === 'Open' || r.status === 'In Progress').length;

    setMetrics({
        activeTasks: active,
        completedTasks: completed,
        delayedTasks: delayed,
        openRisks: openRisksCount
    });

  }, [selectedMonth, tasks, risks]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // In a real app, this would call the AI service. 
      // For now, we simulate or use the existing service if connected.
      // If no service, we initialize empty fields for manual entry as per design.
      
      const newReview: MonthlyReview = {
        id: `review-${Date.now()}`,
        lineId,
        month: selectedMonth,
        summary: '',
        achievements: '',
        issues: '',
        nextSteps: ''
      };
      
      setReview(newReview);
    } catch (error) {
      console.error("Error generating review", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialize empty review if none exists for manual editing
  useEffect(() => {
      if (!review) {
          setReview({
            id: `review-temp`,
            lineId,
            month: selectedMonth,
            summary: '',
            achievements: '',
            issues: '',
            nextSteps: ''
          });
      }
  }, [selectedMonth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Revisión Mensual</h2>
          <p className="text-muted-foreground mt-1">Informe de estado, logros y plan de acción.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-input rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input 
                type="month" 
                className="bg-transparent border-none text-foreground font-medium focus:ring-0 outline-none cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Report Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Document Header Card */}
            <div className="bg-card border border-border rounded-t-xl p-4 flex justify-between items-center border-b-0 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <FileText className="h-5 w-5" />
                    DOCUMENTO DE REVISIÓN
                </div>
                <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors">
                    <Download className="h-5 w-5" />
                </button>
            </div>

            {/* Main Form Container */}
            <div className="bg-card border border-border rounded-b-xl rounded-tr-xl p-6 shadow-sm space-y-8 -mt-6">
                
                {/* Executive Summary */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">RESUMEN EJECUTIVO</label>
                    <textarea 
                        className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y transition-all"
                        placeholder="Visión general del estado del proyecto este mes..."
                        value={review?.summary || ''}
                        onChange={e => setReview(prev => prev ? {...prev, summary: e.target.value} : null)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Achievements */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            LOGROS PRINCIPALES
                        </label>
                        <textarea 
                            className="w-full min-h-[150px] p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all"
                            placeholder="Lista de hitos conseguidos..."
                            value={review?.achievements || ''}
                            onChange={e => setReview(prev => prev ? {...prev, achievements: e.target.value} : null)}
                        />
                    </div>

                    {/* Issues */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            BLOQUEOS Y RIESGOS
                        </label>
                        <textarea 
                            className="w-full min-h-[150px] p-4 rounded-xl border border-rose-200 bg-rose-50/30 dark:bg-rose-900/10 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none transition-all"
                            placeholder="Problemas detectados y áreas de atención..."
                            value={review?.issues || ''}
                            onChange={e => setReview(prev => prev ? {...prev, issues: e.target.value} : null)}
                        />
                    </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">PRÓXIMOS PASOS ESTRATÉGICOS</label>
                    <textarea 
                        className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y transition-all"
                        placeholder="Acciones clave para el mes entrante..."
                        value={review?.nextSteps || ''}
                        onChange={e => setReview(prev => prev ? {...prev, nextSteps: e.target.value} : null)}
                    />
                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all">
                    <Save className="h-5 w-5" />
                    Guardar Revisión
                </button>
            </div>

        </div>

        {/* Right Column: Metrics (1/3 width) */}
        <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
                
                <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="h-6 w-6 text-slate-600" />
                    <h3 className="text-lg font-bold text-foreground">Métricas de {selectedMonth}</h3>
                </div>

                <div className="space-y-8">
                    
                    {/* Active Tasks Metric */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground">Tareas Activas</span>
                            <span className="text-xl font-bold text-foreground">{metrics.activeTasks}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-slate-500 w-full rounded-full" />
                        </div>
                    </div>

                    {/* Completed Tasks Metric */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground">Completadas</span>
                            <span className="text-xl font-bold text-emerald-600">{metrics.completedTasks}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${(metrics.completedTasks / (metrics.activeTasks + metrics.completedTasks || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Delayed Tasks Metric */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground">Retrasadas</span>
                            <span className="text-xl font-bold text-rose-600">{metrics.delayedTasks}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${(metrics.delayedTasks / (metrics.activeTasks + metrics.completedTasks || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Risks Card */}
                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-amber-800 dark:text-amber-500">Riesgos Abiertos</span>
                        <span className="text-2xl font-bold text-amber-600">{metrics.openRisks}</span>
                    </div>

                </div>

            </div>
        </div>

      </div>
    </div>
  );
};
