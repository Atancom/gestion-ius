import React, { useState } from 'react';
import { WorkLine } from '../types';
import { Plus, Trash2, ArrowRight, Briefcase, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineSelectorProps {
  lines: WorkLine[];
  onSelectLine: (id: string) => void;
  onAddLine: (line: WorkLine) => void;
  onDeleteLine: (id: string) => void;
}

export const LineSelector: React.FC<LineSelectorProps> = ({ lines, onSelectLine, onAddLine, onDeleteLine }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLineName, setNewLineName] = useState('');
  const [newLineDesc, setNewLineDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLineName.trim()) return;
    
    const newLine: WorkLine = {
      id: `line-${Date.now()}`,
      name: newLineName,
      description: newLineDesc,
      createdAt: new Date().toISOString()
    };
    
    onAddLine(newLine);
    setNewLineName('');
    setNewLineDesc('');
    setIsAdding(false);
  };

  const filteredLines = lines.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30 mb-4">
                <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Líneas de Trabajo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Selecciona una línea de negocio para gestionar sus proyectos, o crea una nueva para expandir tus operaciones.
            </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Buscar línea..." 
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
                <Plus className="h-5 w-5" />
                Nueva Línea
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLines.map(line => (
            <div 
                key={line.id} 
                className="group relative bg-card hover:bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => onSelectLine(line.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteLine(line.id); }}
                    className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar línea"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{line.name}</h3>
              <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-3">{line.description || "Sin descripción"}</p>
              
              <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:translate-x-1 transition-transform">
                Acceder al Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          ))}
          
          {filteredLines.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                  No se encontraron líneas de trabajo.
              </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Nueva Línea de Trabajo</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  placeholder="Ej. Consultoría Legal"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                  value={newLineDesc}
                  onChange={(e) => setNewLineDesc(e.target.value)}
                  placeholder="Breve descripción de los objetivos..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  Crear Línea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
