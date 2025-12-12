import React from 'react';
import { Task } from '../types';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  tasks: Task[];
}

export const Timeline: React.FC<TimelineProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  // Calculate view range (2 weeks)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(addDays(startDate, 13), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrev = () => setCurrentDate(addDays(currentDate, -14));
  const handleNext = () => setCurrentDate(addDays(currentDate, 14));
  const handleToday = () => setCurrentDate(new Date());

  // Filter tasks visible in current range
  const visibleTasks = tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return (taskStart <= endDate && taskEnd >= startDate);
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const getTaskStyle = (task: Task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      
      // Calculate position and width relative to the visible range
      let startOffset = differenceInDays(taskStart, startDate);
      let duration = differenceInDays(taskEnd, taskStart) + 1;

      // Clip to visible range
      if (startOffset < 0) {
          duration += startOffset;
          startOffset = 0;
      }
      
      // Cap duration if it extends beyond view
      const maxDuration = 14 - startOffset;
      if (duration > maxDuration) duration = maxDuration;

      return {
          gridColumnStart: startOffset + 2, // +2 because col 1 is task name
          gridColumnEnd: `span ${Math.max(duration, 1)}`,
      };
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Completed': return 'bg-emerald-500 border-emerald-600';
          case 'In Progress': return 'bg-blue-500 border-blue-600';
          
          default: return 'bg-slate-400 border-slate-500';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Cronograma</h2>
          <p className="text-muted-foreground mt-1">Visualización temporal de tareas y entregas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 shadow-sm">
            <button onClick={handlePrev} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={handleToday} className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Hoy
            </button>
            <span className="text-sm font-medium px-2 min-w-[140px] text-center">
                {format(startDate, 'd MMM', { locale: es })} - {format(endDate, 'd MMM', { locale: es })}
            </span>
            <button onClick={handleNext} className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto glass-panel rounded-2xl border border-border shadow-inner bg-background/50">
        <div className="min-w-[1000px] p-6">
            
            {/* Calendar Header */}
            <div className="grid grid-cols-[250px_repeat(14,1fr)] gap-px mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border pb-2">
                <div className="font-semibold text-muted-foreground pl-2">Tarea</div>
                {days.map((day, i) => (
                    <div key={i} className={cn(
                        "text-center text-xs py-2 rounded-lg",
                        isSameDay(day, new Date()) ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                    )}>
                        <div className="font-medium">{format(day, 'EEE', { locale: es })}</div>
                        <div className="text-lg">{format(day, 'd')}</div>
                    </div>
                ))}
            </div>

            {/* Tasks Rows */}
            <div className="space-y-2">
                {visibleTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay tareas programadas para este periodo.
                    </div>
                ) : (
                    visibleTasks.map(task => (
                        <div key={task.id} className="grid grid-cols-[250px_repeat(14,1fr)] gap-x-px items-center hover:bg-accent/30 rounded-lg transition-colors group">
                            <div className="truncate pr-4 py-3 text-sm font-medium text-foreground pl-2 border-r border-border/50">
                                {task.title}
                                <div className="text-xs text-muted-foreground font-normal truncate">{task.assignee}</div>
                            </div>
                            
                            {/* Gantt Bar */}
                            <div 
                                className={cn(
                                    "h-8 rounded-md shadow-sm border flex items-center px-2 text-xs text-white font-medium truncate relative overflow-hidden transition-all hover:brightness-110 cursor-pointer",
                                    getStatusColor(task.status)
                                )}
                                style={getTaskStyle(task)}
                                title={`${task.title} (${format(new Date(task.startDate), 'd MMM')} - ${format(new Date(task.endDate), 'd MMM')})`}
                            >
                                <div className="absolute inset-0 bg-black/10" style={{ width: `${task.progress}%` }} />
                                <span className="relative z-10 drop-shadow-md">{task.progress}%</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
