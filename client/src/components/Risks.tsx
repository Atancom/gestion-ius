import React, { useState } from 'react';
import { Risk, Task } from '../types';
import { Plus, Search, AlertTriangle, ShieldAlert, Edit2, Trash2, X } from 'lucide-react';
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
        mitigationStrategy: ''
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

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRisks.map(risk => (
          <div key={risk.id} className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col h-full border-l-4" style={{ borderLeftColor: risk.impact === 'High' ? 'var(--destructive)' : risk.impact === 'Medium' ? 'var(--color-amber-500)' : 'var(--color-blue-500)' }}>
            
            <div className="flex justify-between items-start mb-4">
              <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getImpactColor(risk.impact))}>
                Impacto {risk.impact}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(risk)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDeleteRisk(risk.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{risk.description}</h3>
            
            <div className="space-y-4 mt-auto">
                <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Acción Requerida</p>
                    <p className="text-sm text-foreground">{risk.requiredAction}</p>
                </div>
                
                {risk.mitigationStrategy && (
                    <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                        <p className="text-xs font-medium text-emerald-600 uppercase mb-1">Estrategia Mitigación</p>
                        <p className="text-sm text-foreground/80">{risk.mitigationStrategy}</p>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>Resp: {risk.responsible}</span>
                    <span className={cn("font-medium", risk.status === 'Closed' ? "text-emerald-600" : "text-amber-600")}>
                        {risk.status}
                    </span>
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
              <h2 className="text-2xl font-bold">{editingRisk ? 'Editar Riesgo' : 'Nuevo Riesgo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción del Riesgo</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]"
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.responsible || ''}
                    onChange={e => setFormData({...formData, responsible: e.target.value})}
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tarea Relacionada (Opcional)</label>
                    <select
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.taskId || ''}
                        onChange={e => setFormData({...formData, taskId: e.target.value})}
                    >
                        <option value="">Ninguna</option>
                        {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Impacto</label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.impact}
                    onChange={e => setFormData({...formData, impact: e.target.value as any})}
                  >
                    <option value="Low">Bajo</option>
                    <option value="Medium">Medio</option>
                    <option value="High">Alto</option>
                  </select>
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Acción Requerida</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={formData.requiredAction || ''}
                    onChange={e => setFormData({...formData, requiredAction: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Estrategia de Mitigación</label>
                  <textarea
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]"
                    value={formData.mitigationStrategy || ''}
                    onChange={e => setFormData({...formData, mitigationStrategy: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                  {editingRisk ? 'Guardar Cambios' : 'Registrar Riesgo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
