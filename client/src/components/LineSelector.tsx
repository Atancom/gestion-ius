import React, { useState } from 'react';
import { WorkLine } from '../types';
import { Plus, Trash2, Briefcase, Search, ArrowRight, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-start pt-16 p-4 md:p-8 relative overflow-hidden">
      
      <div className="w-full max-w-4xl z-10 space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/20 mb-2">
                <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Líneas de Trabajo
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
                Gestión centralizada de tus líneas de negocio y proyectos.
            </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar línea..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-all shadow-md shadow-blue-900/10 text-sm whitespace-nowrap"
            >
                <Plus className="h-4 w-4" />
                Nueva Línea
            </button>
        </div>

        {/* Vertical List (Rows) */}
        <div className="flex flex-col space-y-3">
          {filteredLines.map(line => (
            <div 
                key={line.id} 
                className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 md:gap-6"
                onClick={() => onSelectLine(line.id)}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="h-5 w-5 text-blue-700" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{line.name}</h3>
                  <p className="text-slate-500 text-sm truncate">{line.description || "Sin descripción"}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                  <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteLine(line.id); }}
                      className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar línea"
                  >
                      <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="hidden md:flex items-center gap-1 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <span>Entrar</span>
                      <ChevronRight className="h-4 w-4" />
                  </div>
              </div>
            </div>
          ))}
          
          {filteredLines.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No se encontraron líneas de trabajo.</p>
              </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Nueva Línea</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900"
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  placeholder="Ej. Consultoría Legal"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] text-slate-900 resize-none"
                  value={newLineDesc}
                  onChange={(e) => setNewLineDesc(e.target.value)}
                  placeholder="Descripción opcional..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-all"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
