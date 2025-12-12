import { GoogleGenAI } from "@google/genai";
import { Risk, Project, Task } from "../types";

// En un entorno real, esto debería estar en el backend para proteger la API Key
// Para esta demo estática, usaremos la key si está disponible o simularemos
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// Función para generar el reporte mensual
export const generateMonthlyReview = async (
  month: string,
  projects: Project[],
  tasks: Task[],
  risks: Risk[]
): Promise<{ summary: string; achievements: string; issues: string; nextSteps: string }> => {
  
  // 1. Preparar datos resumen para el prompt
  const completedTasks = tasks.filter(t => t.status === 'Completed').map(t => t.title).join(', ');
  const delayedTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.endDate) < new Date()).map(t => t.title).join(', ');
  const activeRisks = risks.filter(r => r.status === 'Open' || r.status === 'In Progress').map(r => r.description).join(', ');
  
  const projectSummaries = projects.map(p => 
    `- Proyecto: ${p.name} (Estado: ${p.status}, Progreso: ${p.progress}%)`
  ).join('\n');

  const userPrompt = `
    Genera el contenido para el Informe de Revisión Mensual correspondiente a: ${month}.
    
    Usa estrictamente los siguientes datos reales del sistema:
    
    DATOS DE PROYECTOS:
    ${projectSummaries}
    
    ACTIVIDAD DEL MES:
    - Tareas Completadas: ${completedTasks || 'Ninguna'}
    - Tareas Retrasadas/Bloqueadas: ${delayedTasks || 'Ninguna'}
    - Riesgos Activos Detectados: ${activeRisks || 'Ninguno'}
    
    Genera una respuesta en formato JSON.
  `;

  try {
    if (!ai) {
        console.warn("Gemini API Key not found. Returning mock data.");
        return {
            summary: "Resumen simulado (API Key no configurada). El mes ha sido productivo con avances significativos en los proyectos principales.",
            achievements: "Se completaron las tareas clave de la fase inicial. La integración del equipo ha mejorado.",
            issues: "Algunos retrasos menores en la entrega de documentación. Riesgos identificados bajo control.",
            nextSteps: "Proceder con la fase de desarrollo. Revisar asignación de recursos para el próximo sprint."
        };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "Actúa como un Director de Proyectos (PMO) senior con experiencia en gestión estratégica. Tu objetivo es redactar informes ejecutivos claros, profesionales y orientados a la acción. Devuelve siempre un JSON válido con las claves: summary, achievements, issues, nextSteps.",
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating review:", error);
    return {
        summary: "Error al generar el resumen automático. Por favor intente más tarde.",
        achievements: "No se pudieron cargar los datos de la IA.",
        issues: "Verifique su conexión o clave API.",
        nextSteps: "Proceda con la revisión manual."
    };
  }
};
