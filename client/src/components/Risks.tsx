import React, { useState } from 'react';
import { Risk, Task } from '../types';
import { Plus, Search, AlertTriangle, ShieldAlert, Edit2, Trash2, X, Link, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RisksProps {
  risks: Risk[];
  tasks: Task[];
  lineId: string;
  onAddRisk: (risk: Risk) => void;
  onUpdateRisk: (risk: Risk) => void;
  onDeleteRisk: (id: string) => void;
}

export const Risks: React.FC<RisksProps> = ({ risks, tasks, lineId, onAddRisk, onUpdateRisk, onDeleteRisk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Risk>>({
    status: 'Open',
    priority: 'Medium',
    impact: 'Medium'
  });

  const handleOpenModal = (risk?: Risk) => {
    if (risk) {
      setEditingRisk(risk);
      setFormData(risk);
    } else {
      setEditingRisk(null);
      setFormData({
        lineId,
        status: 'Open',
        priority: 'Medium',
        impact: 'Medium',
        description: '',
        responsible: '',
        requiredAction: '',
        mitigationStrategy: '',
        taskId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRisk) {
      onUpdateRisk({ ...editingRisk, ...formData } as Risk);
    } else {
      onAddRisk({
        ...formData,
        id: `risk-${Date.now()}`,
        lineId
      } as Risk);
    }
    setIsModalOpen(false);
  };

  const filteredRisks = risks.filter(r => 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.responsible.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
      switch (priority) {
          case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
          case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
          default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
      }
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Closed': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
          case 'Mitigated': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
          case 'In Progress': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
          default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Riesgos</h2>
          <p className="text-muted-foreground mt-1">Identificación y mitigación de amenazas potenciales.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar riesgo..." 
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
            Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* Risks Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/50 shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2">Tarea Vinculada</div>
            <div className="col-span-3">Descripción</div>
            <div className="col-span-2">Responsable</div>
            <div className="col-span-2">Acción Requerida</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-1">Prioridad</div>
            <div className="col-span-1 text-right">Acciones</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/50">
            {filteredRisks.length > 0 ? (
                filteredRisks.map(risk => {
                    const linkedTask = tasks.find(t => t.id === risk.taskId);
                    return (
                        <div key={risk.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-accent/50 transition-colors group">
                            
                            {/* Column 1: Linked Task */}
                            <div className="col-span-2 text-sm text-muted-foreground truncate flex items-center gap-2">
                                <Link className="h-3 w-3 shrink-0" />
                                <span title={linkedTask?.title || 'General'}>
                                    {linkedTask ? linkedTask.title : '-- General --'}
                                </span>
                            </div>

                            {/* Column 2: Description */}
                            <div className="col-span-3 font-medium text-foreground truncate" title={risk.description}>
                                {risk.description}
                            </div>

                            {/* Column 3: Responsible */}
                            <div className="col-span-2 text-sm text-muted-foreground truncate">
                                {risk.responsible}
                            </div>

                            {/* Column 4: Action */}
                            <div className="col-span-2 text-sm text-muted-foreground truncate" title={risk.requiredAction}>
                                {risk.requiredAction}
                            </div>

                            {/* Column 5: Status */}
                            <div className="col-span-1">
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border inline-block", getStatusColor(risk.status))}>
                                    {risk.status === 'Open' ? 'Abierto' : risk.status === 'In Progress' ? 'En Progreso' : risk.status === 'Mitigated' ? 'Mitigado' : 'Cerrado'}
                                </span>
                            </div>

                            {/* Column 6: Priority & Impact */}
                            <div className="col-span-1 flex flex-col gap-1">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium w-fit", getPriorityColor(risk.priority))}>
                                    {risk.priority}
                                </span>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium w-fit border", getImpactColor(risk.impact))}>
                                    Imp: {risk.impact}
                                </span>
                            </div>

                            {/* Column 7: Actions */}
                            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(risk)} className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDeleteRisk(risk.id)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                        </div>
                    );
                })
            ) : (
                <div className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <AlertOctagon className="h-10 w-10 text-muted-foreground/50" />
                        <p>No hay riesgos registrados.</p>
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
                    <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold">{editingRisk ? 'Editar Riesgo' : 'Registrar Nuevo Riesgo'}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <form id="risk-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Row 1: Link & Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vincular a Tarea / Subtarea</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                    value={formData.taskId || ''}
                                    onChange={e => setFormData({...formData, taskId: e.target.value})}
                                >
                                    <option value="">-- General (Sin vincular) --</option>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descripción del Riesgo</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej. Retraso en entregas de proveedores..."
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Row 2: Responsible, Impact, Priority, Status */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Responsable</label>
                            <input
                                type="text"
                                placeholder="Nombre..."
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.responsible || ''}
                                onChange={e => setFormData({...formData, responsible: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Impacto (Severidad)</label>
                            <select
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.impact}
                                onChange={e => setFormData({...formData, impact: e.target.value as any})}
                            >
                                <option value="Low">Bajo</option>
                                <option value="Medium">Medio</option>
                                <option value="High">Alto</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prioridad de Acción</label>
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
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</label>
                            <select
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="Open">Abierto</option>
                                <option value="In Progress">En Progreso</option>
                                <option value="Mitigated">Mitigado</option>
                                <option value="Closed">Cerrado</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Action & Mitigation */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acción Requerida / Mitigación</label>
                            <textarea
                                placeholder="Plan para evitar o mitigar el riesgo..."
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-y"
                                value={formData.requiredAction || ''}
                                onChange={e => setFormData({...formData, requiredAction: e.target.value})}
                            />
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
                    form="risk-form"
                    className="px-6 py-2.5 text-sm font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-lg shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {editingRisk ? 'Guardar Cambios' : 'Guardar Riesgo'}
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
