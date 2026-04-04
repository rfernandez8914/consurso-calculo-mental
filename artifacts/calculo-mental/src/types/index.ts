export interface Alumno {
  id: string;
  nombre: string;
  usado: boolean;
}

export interface Operacion {
  id: string;
  texto: string;
  respuesta: string | number;
}

export interface RespuestaAlumno {
  operacionId: string;
  textoOperacion: string;
  respuestaCorrecta: string | number;
  respuestaAlumno: string;
  esCorrecta: boolean;
}

export interface ResultadoRonda {
  alumno: Alumno;
  respuestas: RespuestaAlumno[];
  totalAciertos: number;
  total: number;
  timestamp: number;
}

export type ModoJuego = 'simple' | 'interactivo';
export type Vista = 'inicio' | 'alumnos' | 'operaciones' | 'juego' | 'resultados' | 'perfil' | 'admin-usuarios';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
}

export interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
