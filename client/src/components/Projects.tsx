import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Search, Calendar, User, Target, BarChart2, Edit2, Trash2, X, CheckSquare, MoreVertical, FileText, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProjectsProps {
  projects: Project[];
  lineId: string;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, lineId, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStep, setNewStep] = useState('');

  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Ready to Start',
    priority: 'Medium',
    difficulty: 'Medium',
    progress: 0,
    isAutoProgress: true,
    nextSteps: []
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({ ...project });
    } else {
      setEditingProject(null);
      setFormData({
        lineId,
        status: 'Ready to Start',
        priority: 'Medium',
        difficulty: 'Medium',
        progress: 0,
        isAutoProgress: true,
        nextSteps: [],
        name: '',
        objective: '',
        assignee: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      onUpdateProject({ ...editingProject, ...formData } as Project);
    } else {
      onAddProject({
        ...formData,
        id: `proj-${Date.now()}`,
        lineId
      } as Project);
    }
    setIsModalOpen(false);
  };

  const addNextStep = () => {
    if (newStep.trim()) {
      setFormData({
        ...formData,
        nextSteps: [...(formData.nextSteps || []), newStep.trim()]
      });
      setNewStep('');
    }
  };

  const removeNextStep = (index: number) => {
    const newSteps = [...(formData.nextSteps || [])];
    newSteps.splice(index, 1);
    setFormData({ ...formData, nextSteps: newSteps });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
      switch (priority) {
          case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
          case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
          default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Proyectos</h2>
          <p className="text-muted-foreground mt-1">Visión global de iniciativas y estado de ejecución.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar proyecto..." 
              className="pl-10 pr-4 py-2 bg-card border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Nombre del Proyecto</div>
            <div className="col-span-2">Responsable</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Progreso</div>
            <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/50">
            {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                    <div key={project.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-accent/50 transition-colors group">
                        
                        {/* Column 1: Name & Priority */}
                        <div className="col-span-4 min-w-0">
                            <div className="font-medium text-foreground truncate" title={project.name}>{project.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", getPriorityColor(project.priority))}>
                                    {project.priority}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(project.endDate), 'dd MMM yyyy')}
                                </span>
                            </div>
                        </div>

                        {/* Column 2: Assignee */}
                        <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4 shrink-0" />
                            <span className="truncate">{project.assignee || 'Sin asignar'}</span>
                        </div>

                        {/* Column 3: Status */}
                        <div className="col-span-2">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block", getStatusColor(project.status))}>
                                {project.status}
                            </span>
                        </div>

                        {/* Column 4: Progress */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-500", 
                                            project.progress === 100 ? "bg-emerald-500" : "bg-primary"
                                        )}
                                        style={{ width: `${project.progress}%` }} 
                                    />
                                </div>
                                <span className="text-xs font-medium w-8 text-right">{project.progress}%</span>
                            </div>
                        </div>

                        {/* Column 5: Actions */}
                        <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(project)} className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                    </div>
                ))
            ) : (
                <div className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Target className="h-10 w-10 text-muted-foreground/50" />
                        <p>No hay proyectos registrados.</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Modal - Full Screen / Large Overlay Style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-5xl my-8 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Detalles del Proyecto</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Row 1: Name & Objective */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre del Proyecto</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej. Implementación ERP Fase 1"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.name || ''}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Objetivo Principal</label>
                            <textarea
                                placeholder="Meta estratégica (se permiten múltiples párrafos)"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] resize-y"
                                value={formData.objective || ''}
                                onChange={e => setFormData({...formData, objective: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Row 2: Assignee & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Responsable</label>
                            <input
                                type="text"
                                placeholder="Nombre y Apellidos"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.assignee || ''}
                                onChange={e => setFormData({...formData, assignee: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Fin</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Row 3: Status, Priority, Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</label>
                            <select
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="Ready to Start">Listo para iniciar</option>
                                <option value="In Progress">En Progreso</option>
                                <option value="Completed">Completado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prioridad</label>
                            <select
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                            >
                                <option value="Low">Baja</option>
                                <option value="Medium">Media</option>
                                <option value="High">Alta</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dificultad</label>
                            <select
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.difficulty}
                                onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                            >
                                <option value="Low">Baja</option>
                                <option value="Medium">Media</option>
                                <option value="High">Alta</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Progress */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progreso del Proyecto</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoProgress"
                                    className="rounded border-input text-primary focus:ring-primary"
                                    checked={formData.isAutoProgress}
                                    onChange={e => setFormData({...formData, isAutoProgress: e.target.checked})}
                                />
                                <label htmlFor="autoProgress" className="text-sm text-muted-foreground cursor-pointer select-none">
                                    Calcular automáticamente basado en tareas
                                </label>
                            </div>
                        </div>
                        
                        <div className={cn("transition-opacity duration-200", formData.isAutoProgress ? "opacity-50 pointer-events-none" : "opacity-100")}>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Avance Manual</span>
                                <span className="text-sm font-bold text-primary">{formData.progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                value={formData.progress || 0}
                                onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Row 5: Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notas Adicionales</label>
                        <textarea
                            placeholder="Observaciones, contexto o detalles importantes..."
                            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-y"
                            value={formData.notes || ''}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    form="project-form"
                    className="px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/25 transition-all"
                >
                    Guardar Proyecto
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
