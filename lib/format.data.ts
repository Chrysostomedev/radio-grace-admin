/**
 * Utility functions for formatting data
 */

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  
  try {
    const d = new Date(date);
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Jui",
      "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return "—";
  }
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  
  try {
    const d = new Date(date);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
