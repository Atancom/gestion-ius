import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  X,
  Globe,
  PieChart,
  Home,
  ChevronRight
} from 'lucide-react';
import { ViewState, UserRole } from '../types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onExitLine: () => void;
  onLogout: () => void;
  lineName: string;
  isOpen: boolean;
  toggleSidebar: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  onExitLine,
  onLogout,
  lineName,
  isOpen,
  toggleSidebar,
  userRole
}) => {
  
  // Función auxiliar para renderizar items de menú
  const renderMenuItem = (id: ViewState, label: string, Icon: any) => {
    const isActive = currentView === id;
    return (
      <button
        key={id}
        onClick={() => {
          onChangeView(id);
          if (window.innerWidth < 768) toggleSidebar();
        }}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
          isActive 
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
          <span>{label}</span>
        </div>
        {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
          "bg-[#0f172a] border-r border-slate-800 shadow-2xl", // Fondo oscuro azulado profundo
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">
                IusTime
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Gestión Integral
              </span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {/* Section: Inicio */}
          <div className="space-y-1">
            <button
              onClick={onExitLine}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Inicio / Cambiar Línea</span>
            </button>
          </div>

          {/* Section: Supervisión Global */}
          <div className="space-y-2">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supervisión Global
            </h3>
            <div className="space-y-1">
              {renderMenuItem(ViewState.GLOBAL_REVIEW, 'Revisión Global', Globe)}
              {renderMenuItem(ViewState.GLOBAL_DASHBOARD, 'Dashboard Global', PieChart)}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-slate-800 mx-4" />

          {/* Section: Gestión de Línea */}
          <div className="space-y-2">
            <div className="px-4 flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gestión de Línea
              </h3>
              {lineName && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50 truncate max-w-[100px]" title={lineName}>
                  {lineName}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              {renderMenuItem(ViewState.PROJECTS, 'Proyectos', FolderKanban)}
              {renderMenuItem(ViewState.TASKS, 'Tareas', CheckSquare)}
              {renderMenuItem(ViewState.TIMELINE, 'Línea de Tiempo', Calendar)}
              {renderMenuItem(ViewState.RISKS, 'Riesgos', AlertTriangle)}
              {renderMenuItem(ViewState.MONTHLY_REVIEW, 'Revisión Mensual', FileText)}
              {renderMenuItem(ViewState.DASHBOARD, 'Dashboard', LayoutDashboard)}
            </div>
          </div>

        </div>

        {/* Footer: Sistema */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div className="space-y-2 mb-4">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Sistema
            </h3>
            {renderMenuItem(ViewState.CONFIGURATION, 'Configuración', Settings)}
          </div>

          <div className="pt-4 border-t border-slate-800/50">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors group"
            >
              <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
              <span>Cerrar Sesión</span>
            </button>
            
            <div className="mt-4 px-4 flex items-center justify-between text-xs text-slate-600">
              <span>v1.3</span>
              <span>{userRole === 'ADMIN' ? 'Administrador' : 'Usuario'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
