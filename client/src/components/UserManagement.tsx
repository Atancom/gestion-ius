import React, { useState } from 'react';
import { User, WorkLine } from '../types';
import { Plus, Search, User as UserIcon, Shield, Mail, Edit2, Trash2, X } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground mt-1">Administra el acceso y roles del personal.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
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
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col relative overflow-hidden">
            
            {/* Role Badge */}
            <div className="absolute top-0 right-0 p-4">
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    user.role === 'ADMIN' 
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20" 
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                )}>
                    {user.role}
                </span>
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-accent flex items-center justify-center text-2xl font-bold text-muted-foreground shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6 flex-1">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Acceso Asignado</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {user.role === 'ADMIN' 
                            ? "Acceso Total (Global)" 
                            : lines.find(l => l.id === user.assignedLineId)?.name || "Sin línea asignada"
                        }
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
                <button 
                    onClick={() => handleOpenModal(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Edit2 className="h-4 w-4" /> Editar
                </button>
                <button 
                    onClick={() => onDeleteUser(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-destructive/10 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                    <Trash2 className="h-4 w-4" /> Eliminar
                </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="text"
                  required={!editingUser}
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={formData.password || ''}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "Dejar en blanco para mantener actual" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="USER">Usuario Estándar</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {formData.role === 'USER' && (
                <div>
                    <label className="block text-sm font-medium mb-1">Línea Asignada</label>
                    <select
                        required
                        className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
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
