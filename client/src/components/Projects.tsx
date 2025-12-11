import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Search, MoreVertical, Calendar, User, Target, Edit2, Trash2, X } from 'lucide-react';
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

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Ready to Start',
    priority: 'Medium',
    difficulty: 'Medium',
    progress: 0
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({
        lineId,
        status: 'Ready to Start',
        priority: 'Medium',
        difficulty: 'Medium',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
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
        lineId,
        nextSteps: [],
        notes: '',
        budget: 0
      } as Project);
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Delayed': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Proyectos</h2>
          <p className="text-muted-foreground mt-1">Gestiona y supervisa el portafolio de proyectos activos.</p>
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getStatusColor(project.status))}>
                {project.status}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(project)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDeleteProject(project.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1" title={project.name}>{project.name}</h3>
            <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-1">{project.objective}</p>

            {/* Meta Info */}
            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{project.assignee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(project.endDate), 'dd MMM yyyy')}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progreso</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nombre del Proyecto</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Objetivo</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]"
                    value={formData.objective || ''}
                    onChange={e => setFormData({...formData, objective: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.assignee || ''}
                    onChange={e => setFormData({...formData, assignee: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="Ready to Start">Por Iniciar</option>
                    <option value="In Progress">En Progreso</option>
                    <option value="Delayed">Retrasado</option>
                    <option value="Completed">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Prioridad</label>
                    <select
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    >
                        <option value="Low">Baja</option>
                        <option value="Medium">Media</option>
                        <option value="High">Alta</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Dificultad</label>
                    <select
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                    >
                        <option value="Low">Baja</option>
                        <option value="Medium">Media</option>
                        <option value="High">Alta</option>
                    </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
