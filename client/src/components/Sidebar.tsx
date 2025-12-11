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
  PieChart
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
  
  const isGlobal = currentView === ViewState.GLOBAL_DASHBOARD || currentView === ViewState.GLOBAL_REVIEW || currentView === ViewState.CONFIGURATION;

  const menuItems = isGlobal ? [
      { id: ViewState.GLOBAL_DASHBOARD, label: 'Visión Global', icon: Globe },
      { id: ViewState.GLOBAL_REVIEW, label: 'Revisión Mensual', icon: FileText },
      { id: ViewState.CONFIGURATION, label: 'Configuración', icon: Settings },
  ] : [
      { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
      { id: ViewState.PROJECTS, label: 'Proyectos', icon: FolderKanban },
      { id: ViewState.TASKS, label: 'Tareas', icon: CheckSquare },
      { id: ViewState.TIMELINE, label: 'Cronograma', icon: Calendar },
      { id: ViewState.RISKS, label: 'Riesgos', icon: AlertTriangle },
      { id: ViewState.MONTHLY_REVIEW, label: 'Revisión Mensual', icon: PieChart },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
          "bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              IusTime
            </span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Line Info */}
        <div className="p-6">
            <div className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border/50 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Línea Actual</p>
                <h3 className="font-semibold text-foreground truncate" title={lineName}>{lineName}</h3>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sidebar-border/50 space-y-2 bg-sidebar/50">
          {userRole === 'ADMIN' && !isGlobal && (
             <button
                onClick={onExitLine}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
             >
                <LogOut className="h-4 w-4" />
                Cambiar Línea
             </button>
          )}
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};
