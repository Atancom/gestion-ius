import React, { useState } from 'react';
import { User, WorkLine } from '../types';
import { Plus, Search, User as UserIcon, Shield, Mail, Edit2, Trash2, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
  lines: WorkLine[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, lines, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<User>>({
    role: 'USER'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        role: 'USER',
        name: '',
        email: '',
        password: '',
        assignedLineId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData } as User);
    } else {
      onAddUser({
        ...formData,
        id: `user-${Date.now()}`
      } as User);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h2>
          <p className="text-muted-foreground mt-1">Gestión de usuarios y permisos de acceso.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:bg-slate-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Usuario</div>
            <div className="col-span-3">Rol</div>
            <div className="col-span-3">Línea Asignada</div>
            <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/50">
            {filteredUsers.map(user => (
                <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-accent/30 transition-colors group">
                    
                    {/* Column 1: User Info */}
                    <div className="col-span-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-foreground truncate">{user.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        </div>
                    </div>

                    {/* Column 2: Role */}
                    <div className="col-span-3">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                            user.role === 'ADMIN' 
                                ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" 
                                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                        )}>
                            <ShieldCheck className="h-3 w-3" />
                            {user.role === 'ADMIN' ? 'Administrador' : 'Usuario Estándar'}
                        </span>
                    </div>

                    {/* Column 3: Assigned Line */}
                    <div className="col-span-3 text-sm text-muted-foreground">
                        {user.role === 'ADMIN' 
                            ? "Acceso Total" 
                            : lines.find(l => l.id === user.assignedLineId)?.name || "Sin línea asignada"
                        }
                    </div>

                    {/* Column 4: Actions */}
                    <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenModal(user)}
                            className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contraseña</label>
                <input
                  type="text"
                  required={!editingUser}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.password || ''}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "Dejar en blanco para mantener actual" : ""}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Rol</label>
                <select
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="USER">Usuario Estándar</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {formData.role === 'USER' && (
                <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Línea Asignada</label>
                    <select
                        required
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={formData.assignedLineId || ''}
                        onChange={e => setFormData({...formData, assignedLineId: e.target.value})}
                    >
                        <option value="">Seleccionar Línea...</option>
                        {lines.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-lg transition-all"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
