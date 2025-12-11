import React, { useState } from 'react';
import { Project, Task, Risk, MonthlyReview } from '../types';
import { generateMonthlyReview } from '../services/geminiService';
import { FileText, Sparkles, Download, Send, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateMonthlyReview(selectedMonth, projects, tasks, risks);
      
      const newReview: MonthlyReview = {
        id: `review-${Date.now()}`,
        lineId,
        month: selectedMonth,
        ...data
      };
      
      setReview(newReview);
    } catch (error) {
      console.error("Error generating review", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 mb-2">
            <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Revisión Mensual Inteligente</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Genera informes ejecutivos automáticos utilizando IA basada en el progreso real de tus proyectos.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10 shadow-xl shadow-primary/5">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Seleccionar Mes</label>
                <input 
                    type="month" 
                    className="bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
                "w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300",
                isGenerating 
                    ? "bg-muted cursor-not-allowed" 
                    : "bg-gradient-to-r from-primary to-purple-600 hover:shadow-primary/40 hover:scale-105"
            )}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analizando Datos...
                </>
            ) : (
                <>
                    <Sparkles className="h-5 w-5" />
                    Generar Informe con IA
                </>
            )}
        </button>
      </div>

      {/* Report Content */}
      {review && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* Summary Card */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileText className="h-32 w-32" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Resumen Ejecutivo</h3>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {review.summary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Achievements */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500">
                    <h3 className="text-xl font-bold mb-4 text-emerald-600 flex items-center gap-2">
                        <span className="p-1 bg-emerald-100 rounded-md">🏆</span> Logros Clave
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {review.achievements}
                    </p>
                </div>

                {/* Issues */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500">
                    <h3 className="text-xl font-bold mb-4 text-amber-600 flex items-center gap-2">
                        <span className="p-1 bg-amber-100 rounded-md">⚠️</span> Problemas y Bloqueos
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {review.issues}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                    <Send className="h-4 w-4" />
                    Enviar por Email
                </button>
            </div>

        </div>
      )}
    </div>
  );
};
