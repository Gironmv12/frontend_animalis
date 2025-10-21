// Constantes que representan los enums del backend.
// Mantener en un solo archivo facilita la sincronización y el mantenimiento.
export const ROLES = [
  { value: "administrador", label: "Administrador" },
  { value: "asistente", label: "Asistente" },
  { value: "veterinario", label: "Veterinario" },
];

export const ESTADO_USUARIO = [
  { value: "A", label: "Activo" },
  { value: "I", label: "Inactivo" },
];

export const GENERO_MASCOTA = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
];

export const ESTADO_MASCOTA = [
  { value: "saludable", label: "Saludable" },
  { value: "en_tratamiento", label: "En tratamiento" },
  { value: "vacunacion", label: "Vacunación" },
];

export const ESTADO_VACUNA = [
  { value: "completo", label: "Completado" },
  { value: "progreso", label: "En progreso" },
  { value: "programado", label: "Programado" },
];

export const URGENCIAS = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

export const TIPO_REGISTRO = [
  { value: "vacuna", label: "Vacuna" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "cirugia", label: "Cirugía" },
  { value: "consulta", label: "Consulta" },
];

export const ESTADO_CITA = [
  { value: "pendiente", label: "Pendiente" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export default {
  ROLES,
  ESTADO_USUARIO,
  GENERO_MASCOTA,
  ESTADO_MASCOTA,
  ESTADO_VACUNA,
  URGENCIAS,
  TIPO_REGISTRO,
  ESTADO_CITA,
};
