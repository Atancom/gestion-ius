import React, { useState, useEffect } from 'react';
import { WorkLine, Project, Task, Risk } from '../types';
import { Sparkles, FileText, Download, Calendar, Save, BrainCircuit, Check } from 'lucide-react';
import { format } from 'date-fns';

interface GlobalReviewProps {
  lines: WorkLine[];
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

interface MonthlyReport {
    vision: string;
    milestones: string;
    attentionAreas: string;
    strategy: string;
    lastUpdated: string;
}

export const GlobalReview: React.FC<GlobalReviewProps> = ({ lines, projects, tasks, risks }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load all reports from storage
  const [allReports, setAllReports] = useState<Record<string, MonthlyReport>>(() => {
      const saved = localStorage.getItem('iustime_global_reviews');
      return saved ? JSON.parse(saved) : {};
  });

  // Current report state
  const [report, setReport] = useState<MonthlyReport>({
    vision: '',
    milestones: '',
    attentionAreas: '',
    strategy: '',
    lastUpdated: new Date().toISOString()
  });

  // Load report when month changes
  useEffect(() => {
      if (allReports[selectedMonth]) {
          setReport(allReports[selectedMonth]);
      } else {
          // Reset to empty if no report exists for this month
          setReport({
            vision: '',
            milestones: '',
            attentionAreas: '',
            strategy: '',
            lastUpdated: new Date().toISOString()
          });
      }
  }, [selectedMonth, allReports]);

  const handleSave = () => {
      setIsSaving(true);
      const updatedReports = {
          ...allReports,
          [selectedMonth]: { ...report, lastUpdated: new Date().toISOString() }
      };
      setAllReports(updatedReports);
      localStorage.setItem('iustime_global_reviews', JSON.stringify(updatedReports));
      
      setTimeout(() => setIsSaving(false), 800);
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    
    // Simulate AI Generation Delay based on real data context (mocked)
    setTimeout(() => {
        const newReport = {
            vision: `Análisis para ${selectedMonth}: La organización muestra un avance sólido del 78% en los objetivos trimestrales. Se observa una consolidación en las líneas de Consultoría, aunque el área Legal presenta ligeros retrasos operativos.`,
            milestones: "• Cierre exitoso del proyecto 'Migración Cloud' en la línea Tecnológica.\n• Incorporación de 3 nuevos clientes estratégicos en el sector Retail.\n• Reducción del 15% en tiempos de respuesta gracias a la nueva automatización.",
            attentionAreas: "• Cuello de botella identificado en la aprobación de presupuestos (Línea Financiera).\n• Riesgo de rotación en el equipo de desarrollo por alta carga de trabajo.\n• Necesidad de actualizar licencias de software antes de fin de mes.",
            strategy: "1. Priorizar la contratación de soporte para el equipo Legal.\n2. Implementar revisión semanal de flujo de caja para desbloquear presupuestos.\n3. Iniciar programa de capacitación cruzada entre departamentos.",
            lastUpdated: new Date().toISOString()
        };
        setReport(newReport);
        
        // Auto-save generated report
        const updatedReports = {
            ...allReports,
            [selectedMonth]: newReport
        };
        setAllReports(updatedReports);
        localStorage.setItem('iustime_global_reviews', JSON.stringify(updatedReports));
        
        setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Revisión Estratégica Global</h2>
          <p className="text-muted-foreground mt-1">Análisis holístico asistido por IA para la dirección general.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-card border border-input rounded-lg px-3 py-2 shadow-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <input 
                    type="month" 
                    className="bg-transparent border-none text-foreground font-medium focus:ring-0 outline-none cursor-pointer"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>
            <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <BrainCircuit className="h-5 w-5 animate-pulse" />
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
      </div>

      {/* Document Container */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Document Toolbar */}
        <div className="bg-muted/30 border-b border-border p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                Informe Ejecutivo - {selectedMonth}
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors" title="Descargar PDF">
                    <Download className="h-5 w-5" />
                </button>
                <button 
                    onClick={handleSave}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isSaving 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                    title="Guardar Cambios"
                >
                    {isSaving ? <Check className="h-4 w-4" /> : <Save className="h-5 w-5" />}
                    {isSaving ? "Guardado" : ""}
                </button>
            </div>
        </div>

        {/* Editor Area */}
        <div className="p-8 space-y-8">
            
            {/* Block 1: Vision */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Visión Holística</label>
                <textarea 
                    className="w-full min-h-[100px] p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-900/30 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-y transition-all text-lg leading-relaxed"
                    placeholder="Resumen ejecutivo del estado general de la empresa..."
                    value={report.vision}
                    onChange={e => setReport({...report, vision: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Block 2: Milestones */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hitos Organizacionales</label>
                    <textarea 
                        className="w-full min-h-[200px] p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-900/30 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all"
                        placeholder="Logros clave alcanzados..."
                        value={report.milestones}
                        onChange={e => setReport({...report, milestones: e.target.value})}
                    />
                </div>

                {/* Block 3: Attention Areas */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-rose-600 uppercase tracking-wider">Áreas de Atención Sistémica</label>
                    <textarea 
                        className="w-full min-h-[200px] p-4 rounded-xl border border-rose-100 bg-rose-50/30 dark:bg-rose-900/10 dark:border-rose-900/30 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none transition-all"
                        placeholder="Cuellos de botella y riesgos críticos..."
                        value={report.attentionAreas}
                        onChange={e => setReport({...report, attentionAreas: e.target.value})}
                    />
                </div>
            </div>

            {/* Block 4: Strategy */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-amber-600 uppercase tracking-wider">Directrices Estratégicas</label>
                <textarea 
                    className="w-full min-h-[120px] p-4 rounded-xl border border-amber-100 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-900/30 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-y transition-all font-medium"
                    placeholder="Recomendaciones y próximos pasos para los directores..."
                    value={report.strategy}
                    onChange={e => setReport({...report, strategy: e.target.value})}
                />
            </div>

        </div>
      </div>
    </div>
  );
};
