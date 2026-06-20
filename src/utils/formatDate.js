

export const formatDate = (dateString) => {
  if (!dateString) return "--/--/----";

  const cleanDate = dateString.split(" ")[0].split("T")[0];

  const [year, month, day] = cleanDate.split("-");
  return `${day}-${month}-${year}`;
};


export const formatDateText = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00'); // T00:00:00 evita problemas de zona horaria
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};