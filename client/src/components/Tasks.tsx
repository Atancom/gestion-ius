import React, { useState } from 'react';
import { Task, Project, ChecklistItem } from '../types';
import { Plus, Search, CheckSquare, Calendar, User, ChevronDown, ChevronRight, Edit2, Trash2, X, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  lineId: string;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({ tasks, projects, lineId, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    status: 'Ready to Start',
    priority: 'Medium',
    difficulty: 'Medium',
    progress: 0,
    checklist: []
  });
  
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) newExpanded.delete(taskId);
    else newExpanded.add(taskId);
    setExpandedTasks(newExpanded);
  };

  const handleOpenModal = (task?: Task, parentId?: string) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData({
        lineId,
        parentId: parentId || null,
        status: 'Ready to Start',
        priority: 'Medium',
        difficulty: 'Medium',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        checklist: [],
        attachments: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask({ ...editingTask, ...formData } as Task);
    } else {
      onAddTask({
        ...formData,
        id: `task-${Date.now()}`,
        lineId,
        dependencies: '',
        comments: '',
        attachments: []
      } as Task);
    }
    setIsModalOpen(false);
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
        id: `check-${Date.now()}`,
        text: newChecklistItem,
        completed: false
    };
    setFormData({ ...formData, checklist: [...(formData.checklist || []), newItem] });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
      const updatedChecklist = formData.checklist?.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setFormData({ ...formData, checklist: updatedChecklist });
  };

  const removeChecklistItem = (itemId: string) => {
      setFormData({ ...formData, checklist: formData.checklist?.filter(i => i.id !== itemId) });
  };

  // Group tasks by project
  const tasksByProject = projects.map(project => ({
    project,
    tasks: tasks.filter(t => t.projectId === project.id && !t.parentId)
  })).filter(group => 
    group.project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    group.tasks.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'Delayed': return 'text-red-600 bg-red-500/10 border-red-500/20';
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

  const TaskRow = ({ task, level = 0 }: { task: Task, level?: number }) => {
    const subtasks = tasks.filter(t => t.parentId === task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);

    return (
      <>
        <div className={cn(
            "group flex items-center gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors",
            level > 0 && "bg-muted/30"
        )} style={{ paddingLeft: `${level * 2 + 1}rem` }}>
          
          <button 
            onClick={() => toggleExpand(task.id)}
            className={cn("p-1 rounded hover:bg-muted transition-colors", !hasSubtasks && "invisible")}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
                <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                {task.checklist.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                    </span>
                )}
                {task.attachments.length > 0 && (
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignee}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(task.endDate), 'dd MMM')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(task.status))}>
                {task.status}
            </span>
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getPriorityColor(task.priority))}>
                {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleOpenModal(undefined, task.id)} className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Añadir Subtarea">
                <Plus className="h-4 w-4" />
            </button>
            <button onClick={() => handleOpenModal(task)} className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => onDeleteTask(task.id)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {isExpanded && subtasks.map(st => <TaskRow key={st.id} task={st} level={level + 1} />)}
      </>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Tareas</h2>
          <p className="text-muted-foreground mt-1">Desglose detallado de actividades por proyecto.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar tarea..." 
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
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {tasksByProject.map(({ project, tasks }) => (
            <div key={project.id} className="glass-panel rounded-2xl overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                    <span className="text-sm text-muted-foreground">{tasks.length} tareas principales</span>
                </div>
                <div>
                    {tasks.length > 0 ? (
                        tasks.map(task => <TaskRow key={task.id} task={task} />)
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No hay tareas registradas para este proyecto.
                        </div>
                    )}
                </div>
            </div>
        ))}
        
        {tasksByProject.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No se encontraron tareas o proyectos.
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Proyecto</label>
                    <select
                        required
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.projectId || ''}
                        onChange={e => setFormData({...formData, projectId: e.target.value})}
                        disabled={!!formData.parentId} // If subtask, inherit project logic could be added
                    >
                        <option value="">Seleccionar Proyecto</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
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
                    <label className="block text-sm font-medium mb-1">Progreso (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.progress}
                        onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                    />
                </div>

                {/* Checklist Section */}
                <div className="col-span-2 border-t border-border pt-4">
                    <label className="block text-sm font-medium mb-2">Checklist</label>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            placeholder="Nuevo item..." 
                            className="flex-1 px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                        />
                        <button 
                            type="button" 
                            onClick={addChecklistItem}
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
                        >
                            Añadir
                        </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.checklist?.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                <input 
                                    type="checkbox" 
                                    checked={item.completed}
                                    onChange={() => toggleChecklistItem(item.id)}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                />
                                <span className={cn("flex-1 text-sm", item.completed && "line-through text-muted-foreground")}>{item.text}</span>
                                <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
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
                  {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
