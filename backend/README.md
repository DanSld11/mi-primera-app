# Backend Express - Bici San Borja

Este backend es un **servidor mock** con datos estáticos en memoria.

**No es usado por la app móvil**, que se conecta directamente a Supabase.

Puede servir para:
- Testing local sin Supabase
- Prototipado web futuro
- Referencia de la API

## Uso

```bash
cd backend
npm install
npm start
# Servidor en http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /estaciones | Lista todas las estaciones |
| GET | /estaciones/cercanas?lat=X&lng=Y | 3 estaciones más cercanas |
| GET | /estaciones/:id | Detalle de una estación |
| POST | /incidencias | Crea una incidencia |
| GET | /incidencias | Lista todas las incidencias |