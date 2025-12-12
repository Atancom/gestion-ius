import React, { useState } from 'react';
import { Task, Project, ChecklistItem } from '../types';
import { Plus, Search, CheckSquare, Calendar, User, ChevronDown, ChevronRight, Edit2, Trash2, X, Paperclip, Filter, ArrowUpDown, Layers, ListTodo, FileText } from 'lucide-react';
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

type SortOption = 'project' | 'priority' | 'difficulty' | 'date';

export const Tasks: React.FC<TasksProps> = ({ tasks, projects, lineId, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // New Filters State
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('project');

  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    status: 'Ready to Start',
    priority: 'Medium',
    difficulty: 'Medium',
    progress: 0,
    checklist: []
  });
  
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSubtaskMode, setIsSubtaskMode] = useState(false);

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
      setIsSubtaskMode(!!task.parentId);
    } else {
      setEditingTask(null);
      const isSubtask = !!parentId;
      setIsSubtaskMode(isSubtask);
      setFormData({
        lineId,
        projectId: selectedProject !== 'all' ? selectedProject : (projects[0]?.id || ''),
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
        dependencies: formData.dependencies || '',
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

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || t.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  // Sort Logic
  const getSortedTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'difficulty':
          const difficultyOrder = { High: 3, Medium: 2, Low: 1 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case 'date':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default:
          return 0;
      }
    });
  };

  // Get all top-level tasks (no parent) sorted
  const topLevelTasks = getSortedTasks(filteredTasks.filter(t => !t.parentId));

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

  const TaskRow = ({ task, level = 0 }: { task: Task, level?: number }) => {
    const subtasks = tasks.filter(t => t.parentId === task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const project = projects.find(p => p.id === task.projectId);

    return (
      <>
        <div className={cn(
            "group grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors items-center",
            level > 0 && "bg-muted/30"
        )}>
          
          {/* Column 1: Project */}
          <div className="col-span-3 text-sm font-medium text-muted-foreground truncate">
             {project?.name || '-'}
          </div>

          {/* Column 2: Task / Subtask */}
          <div className="col-span-5 flex items-center gap-2 min-w-0">
             <div style={{ width: `${level * 1.5}rem` }} className="shrink-0" />
             
             <button 
                onClick={() => toggleExpand(task.id)}
                className={cn("p-1 rounded hover:bg-muted transition-colors shrink-0", !hasSubtasks && "invisible")}
             >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
             </button>

             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">{task.title}</span>
                    {task.checklist.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <CheckSquare className="h-3 w-3" />
                            {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                        </span>
                    )}
                    {task.attachments.length > 0 && (
                        <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", getStatusColor(task.status))}>
                        {task.status}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", getPriorityColor(task.priority))}>
                        {task.priority}
                    </span>
                </div>
             </div>
          </div>

          {/* Column 3: Responsible */}
          <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
             <User className="h-4 w-4 shrink-0" />
             <span className="truncate">{task.assignee || 'Sin asignar'}</span>
          </div>

          {/* Column 4: Dates & Actions */}
          <div className="col-span-2 flex items-center justify-between">
             <div className="flex flex-col text-xs text-muted-foreground">
                <span>{format(new Date(task.startDate), 'dd MMM')}</span>
                <span>{format(new Date(task.endDate), 'dd MMM')}</span>
             </div>

             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(undefined, task.id)} className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Añadir Subtarea">
                    <Plus className="h-4 w-4" />
                </button>
                <button onClick={() => handleOpenModal(task)} className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDeleteTask(task.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                </button>
             </div>
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
          <p className="text-muted-foreground mt-1">Gestión detallada de actividades y entregables.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Project Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">Ver Todos los Proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[180px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="project">Agrupar por Proyecto</option>
              <option value="priority">Ordenar por Prioridad</option>
              <option value="difficulty">Ordenar por Dificultad</option>
              <option value="date">Ordenar por Fecha</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Proyecto</div>
            <div className="col-span-5">Tarea / Subtarea</div>
            <div className="col-span-2">Responsable</div>
            <div className="col-span-2">Fechas</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/50">
            {topLevelTasks.length > 0 ? (
                topLevelTasks.map(task => <TaskRow key={task.id} task={task} />)
            ) : (
                <div className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <ListTodo className="h-10 w-10 text-muted-foreground/50" />
                        <p>No hay tareas que coincidan con los filtros.</p>
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
                        <ListTodo className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Task Type Toggle */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de Actividad</label>
                        <div className="grid grid-cols-2 gap-4 p-1 bg-muted/50 rounded-xl border border-border/50">
                            <button
                                type="button"
                                onClick={() => setIsSubtaskMode(false)}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                                    !isSubtaskMode 
                                        ? "bg-background text-primary shadow-sm border border-border" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ListTodo className="h-4 w-4" />
                                Tarea Principal
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSubtaskMode(true)}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                                    isSubtaskMode 
                                        ? "bg-background text-primary shadow-sm border border-border" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Layers className="h-4 w-4" />
                                Subtarea
                            </button>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proyecto</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={formData.projectId || ''}
                                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                                    disabled={!!formData.parentId}
                                >
                                    <option value="" disabled>Seleccionar Proyecto...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Responsable</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={formData.assignee || ''}
                                    onChange={e => setFormData({...formData, assignee: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Fin</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                    />
                                </div>
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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre de la Tarea</label>
                                <textarea
                                    required
                                    placeholder="Descripción corta..."
                                    rows={1}
                                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                    />
                                </div>
                            </div>

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
                    </div>

                    {/* Dependencies & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dependencias</label>
                            <input
                                type="text"
                                placeholder="Ej. Tarea A"
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.dependencies || ''}
                                onChange={e => setFormData({...formData, dependencies: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progreso Manual</label>
                                <span className="text-xs font-bold text-primary">{formData.progress}%</span>
                            </div>
                            <div className="pt-2 px-1">
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
                    </div>

                    {/* Bottom Panels: Checklist & Files */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Checklist Panel */}
                        <div className="border border-border rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-foreground" />
                                <h3 className="font-bold text-foreground">Checklist</h3>
                            </div>
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nuevo item..."
                                    className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                    value={newChecklistItem}
                                    onChange={e => setNewChecklistItem(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                                />
                                <button 
                                    type="button"
                                    onClick={addChecklistItem}
                                    className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {formData.checklist?.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic text-center py-2">No hay items en la lista</p>
                                )}
                                {formData.checklist?.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg group">
                                        <button
                                            type="button"
                                            onClick={() => toggleChecklistItem(item.id)}
                                            className={cn(
                                                "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                item.completed ? "bg-primary border-primary text-primary-foreground" : "border-input hover:border-primary"
                                            )}
                                        >
                                            {item.completed && <CheckSquare className="h-3 w-3" />}
                                        </button>
                                        <span className={cn("text-sm flex-1", item.completed && "line-through text-muted-foreground")}>
                                            {item.text}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeChecklistItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Files Panel */}
                        <div className="border border-border rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-foreground" />
                                <h3 className="font-bold text-foreground">Archivos</h3>
                            </div>
                            
                            <div>
                                <button 
                                    type="button"
                                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Subir Archivo
                                </button>
                            </div>

                            <div className="min-h-[100px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
                            </div>
                        </div>

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
                    form="task-form"
                    className="px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/25 transition-all"
                >
                    Guardar
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
