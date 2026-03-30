import Dexie from 'dexie';

// Creamos la base de datos local "SyncroDB"
export const db = new Dexie('SyncroDB');

// Definimos las tablas. 
// El "++id" no lo usamos porque usamos UUID, así que ponemos "id" como clave primaria.
db.version(1).stores({
  tasks: 'id, user_id, status, due_date, updated_at, is_deleted, sincronizado' 
});