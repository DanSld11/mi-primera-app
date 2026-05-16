# Bici San Borja - Contexto del Proyecto
## Archivo de handoff para cambio de modelo de IA

---

## 1. QUE ES ESTE PROYECTO

Aplicacion movil de **bicicletas publicas para el distrito de San Borja (Lima, Peru)**.

**Funcionalidades principales:**
- Mapa interactivo con estaciones de bicicletas (Google Maps nativo)
- Estado en tiempo real de cada estacion (disponible, pocas, llena, vacia)
- Reporte de incidencias por parte de ciudadanos
- Sistema de autenticacion completo (login/registro/recuperar password)
- Roles: ciudadano y administrador
- Panel de administracion con dashboard, gestion de estaciones (CRUD) y gestion de incidencias
- Actualizaciones automaticas Over-The-Air (OTA) via EAS Update

---

## 2. STACK TECNOLOGICO

| Tecnologia | Version |
|-----------|---------|
| Expo SDK | 55.0.0 |
| React Native | 0.83.6 |
| React | 19.2.0 |
| expo-router | ~55.0.14 (file-based routing) |
| expo-updates | ~55.0.22 (OTA updates) |
| react-native-maps | 1.27.2 (Google Maps) |
| Supabase | @supabase/supabase-js ^2.105.4 |
| EAS CLI | ^18.12.3 |
| TypeScript | ~5.9.2 |
| New Architecture | ACTIVADA (`newArchEnabled: true`) |

**Builds:** Se usa EAS para builds en la nube, pero tambien se puede hacer build local con `expo run:android --variant release`.

---

## 3. ESTRUCTURA DE ARCHIVOS CLAVE

```
mi-primera-app/
|-- app/                          # Expo Router (file-based routing)
|   |-- _layout.tsx               # Layout raiz con AuthProvider + ProtectedRouteGuard
|   |-- index.tsx                 # Redirige a /login o /(tabs)
|   |-- login.tsx                 # Pantalla login (publica)
|   |-- registro.tsx              # Pantalla registro (publica)
|   |-- recuperar-password.tsx    # Pantalla recuperar password (publica)
|   |-- (tabs)/                   # Grupo de tabs ciudadano
|   |   |-- _layout.tsx           # Tabs con boton logout en header
|   |   |-- index.tsx             # Mapa principal
|   |   |-- explore.tsx           # Lista de estaciones
|   |-- (admin)/                  # Grupo de tabs administrador
|   |   |-- _layout.tsx           # Tabs admin
|   |   |-- dashboard.tsx         # Dashboard admin
|   |   |-- estaciones.tsx        # Gestion estaciones
|   |   |-- incidencias.tsx       # Lista incidencias
|   |-- detalle-estacion.tsx
|   |-- detalle-incidencia-admin.tsx
|   |-- reporte-incidencia.tsx
|   |-- recomendaciones.tsx
|   |-- modal.tsx
|
|-- src/
|   |-- constants/
|   |   |-- config.js             # SUPABASE_URL y SUPABASE_ANON_KEY
|   |   |-- colors.js             # Paleta de colores
|   |-- context/
|   |   |-- AuthContext.js        # Contexto global de autenticacion
|   |-- services/
|   |   |-- supabase.js           # Cliente Supabase
|   |   |-- authService.js        # Login, registro, logout, resetearPassword
|   |   |-- api.js                # API publica ciudadano (getEstaciones, postIncidencia)
|   |   |-- adminService.js       # Stats, CRUD estaciones, gestion incidencias
|   |-- screens/
|   |   |-- LoginScreen.js
|   |   |-- RegistroScreen.js
|   |   |-- RecuperarPasswordScreen.js
|   |   |-- MapaScreen.js / MapaScreen.native.js
|   |   |-- DetalleEstacionScreen.js
|   |   |-- ReporteIncidenciaScreen.js
|   |   |-- RecomendacionesScreen.js
|   |   |-- AdminDashboardScreen.js
|   |   |-- admin/
|   |   |   |-- GestionEstacionesScreen.js
|   |   |   |-- IncidenciasScreen.js
|   |   |   |-- DetalleIncidenciaAdminScreen.js
|
|-- sql/
|   |-- auth-setup.sql            # Tabla perfiles, triggers, RLS, politicas
|   |-- add-estado-incidencias.sql # Columna estado en incidencias
|   |-- crear-admin.sql           # Script para crear usuario admin
|
|-- plugins/
|   |-- with-google-maps-api-key  # Plugin custom para inyectar Google Maps API Key en AndroidManifest.xml
|
|-- android/                      # Proyecto nativo Android (generado con prebuild)
|-- app.json                      # Configuracion Expo
|-- eas.json                      # Perfiles de build EAS
```

---

## 4. CONFIGURACIONES CRITICAS

### 4.1 Supabase
- **URL:** `https://vsvrfggfblozaelpnbhf.supabase.co`
- **ANON KEY:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdnJmZ2dmYmxvemFlbHBuYmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzc0NDgsImV4cCI6MjA5NDM1MzQ0OH0.JV9LkRvyf9T134Av_uSVsxTwRKIp7vVCa7l1aAmlYGo`
- Archivo: `src/constants/config.js`

**IMPORTANTE:** Esta clave anon fue corregida recientemente. Antes tenia una clave de Stripe (`sb_publishable_...`) que hacia fallar TODO el login.

### 4.2 EAS / Expo Updates
- **EAS Project ID:** `8d0a534f-7a94-4ccd-a69b-dae6dee84b9a`
- **Runtime Version:** `appVersion` (sigue la version de `app.json`)
- **Current version:** `1.0.0`
- **Update URL:** `https://u.expo.dev/8d0a534f-7a94-4ccd-a69b-dae6dee84b9a`
- **Check:** `ON_LOAD`

### 4.3 Google Maps
- **API Key:** `AIzaSyBtZ5KKYkTS43HgvUWzwtCHgljgjvQwdhQ`
- Inyectado via plugin custom en `AndroidManifest.xml`
- El plugin esta en `plugins/with-google-maps-api-key.js`

### 4.4 New Architecture
- `newArchEnabled: true` en `app.json`
- `edgeToEdgeEnabled` fue ELIMINADO de `app.json` (obsoleto en SDK 55, Android 16 lo hace obligatorio)

### 4.5 Deep Linking
- Scheme: `miprimeraapp`
- Usado en recuperacion de password: `miprimeraapp://reset-password`

---

## 5. BASE DE DATOS (SUPABASE)

### Tablas existentes:
1. **estaciones** - Estaciones de bicicletas
   - `id`, `nombre`, `direccion`, `latitud`, `longitud`, `bicicletas_disponibles`, `capacidad_total`, `estado` (disponible/pocas/llena/vacia), `created_at`

2. **incidencias** - Reportes de ciudadanos
   - `id`, `tipo`, `descripcion`, `estacion_id` (FK), `foto_url`, `estado` (pendiente/en revision/resuelta), `created_at`
   - NOTA: La columna `estado` fue agregada via `sql/add-estado-incidencias.sql`

3. **perfiles** - Perfiles de usuarios con roles
   - `id` (UUID, PK, FK auth.users), `email`, `nombre_completo`, `rol` (ciudadano/administrador), `fecha_creacion`
   - Se crea automaticamente via trigger `trigger_crear_perfil` en `auth.users`

### RLS (Row Level Security) activo:
- `perfiles`: usuarios solo leen/editan su propio perfil
- `estaciones`: cualquiera puede leer, solo admin puede insertar/actualizar/eliminar
- `incidencias`: cualquier autenticado puede insertar, solo admin puede leer todas

### Trigger:
- `trigger_crear_perfil` en `auth.users` -> inserta fila en `public.perfiles` con rol='ciudadano'

---

## 6. SISTEMA DE AUTENTICACION Y ROLES

### Flujo:
1. `AuthContext` provee `{ usuario, perfil, rol, cargando, logout }` a toda la app
2. `ProtectedRouteGuard` (en `app/_layout.tsx`) redirige segun estado:
   - No autenticado -> `/login` (o `/registro`, `/recuperar-password`)
   - Autenticado ciudadano -> `/(tabs)`
   - Autenticado administrador -> `/(admin)`

### Rutas publicas (no requieren auth):
- `/login`
- `/registro`
- `/recuperar-password`

### Como crear un administrador:
1. Crear usuario en Supabase Dashboard -> Authentication -> Users -> Add user
2. Obtener UUID del usuario
3. Ejecutar en SQL Editor:
   ```sql
   UPDATE public.perfiles SET rol = 'administrador' WHERE id = 'UUID_AQUI';
   ```
   (ver `sql/crear-admin.sql` para instrucciones completas)

---

## 7. ERRORES CONOCIDOS Y SOLUCIONES RECIENTES

### 7.1 [SOLUCIONADO] Boton "Olvidaste tu contraseña" no funcionaba
- **Causa:** La ruta `/recuperar-password` no estaba incluida en `inAuthGroup` en `ProtectedRouteGuard`, por lo que redirigia a `/login` inmediatamente.
- **Fix:** En `app/_layout.tsx`, linea 42:
  ```tsx
  const inAuthGroup = segment === 'login' || segment === 'registro' || segment === 'recuperar-password';
  ```

### 7.2 [SOLUCIONADO] Login siempre fallaba
- **Causa:** `SUPABASE_ANON_KEY` en `src/constants/config.js` era una clave de Stripe (`sb_publishable_...`) en vez de la clave anon de Supabase.
- **Fix:** Se reemplazo por la clave anon real.

### 7.3 [SOLUCIONADO] EAS Update no llegaba al celular
- **Causa:** El APK instalado era el antiguo (generado antes de agregar `expo-updates` nativamente).
- **Fix:** Se regenero el proyecto nativo con `npx expo prebuild --clean` y se hizo build local.

### 7.4 [SOLUCIONADO] Imports relativos fallaban en release
- **Causa:** En builds de release/EAS Update, Metro resuelve paths relativos (`../../services/...`) desde el entry point, causando errores.
- **Fix:** Todos los imports en `src/screens/` fueron cambiados a aliases `@/` (ej: `@/src/services/authService`).

### 7.5 [PENDIENTE] Verificacion en dispositivo fisico
- El APK fue generado exitosamente pero aun NO se ha instalado ni probado en un dispositivo fisico real.
- APK path: `android/app/build/outputs/apk/release/app-release.apk` (~91.8 MB)

---

## 8. COMO HACER BUILD

### Build local (Android release):
```bash
# Si se modifica algo nativo (app.json, plugins, etc.)
npx expo prebuild --clean

# Build release local
npx expo run:android --variant release
```

**Notas para build local:**
- Se necesita `local.properties` en `android/` apuntando al SDK de Android
- Se usa `org.gradle.jvmargs=-Xmx4096m` para evitar OutOfMemory
- `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64` (4 arquitecturas)

### Build via EAS:
```bash
# Preview (APK interno)
npx eas build -p android --profile preview

# Production (AAB para Play Store)
npx eas build -p android --profile production
```

### Publicar EAS Update:
```bash
npx eas update --auto
```

---

## 9. ULTIMO EAS UPDATE PUBLICADO

- **Update Group ID:** `0d37ed71-abbd-4fa1-a5c0-5565cc815de8`
- **Branch:** `master`
- **Runtime Version:** `1.0.0`
- **Platform:** android, ios
- **Mensaje:** `actualizacion`
- **Commit:** `8865bfcf8387d66691dfeb0eb44eb3063e5aca19`
- **Dashboard:** https://expo.dev/accounts/dansld/projects/bici-san-borja/updates/0d37ed71-abbd-4fa1-a5c0-5565cc815de8

---

## 10. DECISIONES CLAVE TOMADAS

1. **Aliases `@/` en vez de paths relativos** para imports en screens, porque Metro en release los resuelve mal.
2. **`runtimeVersion: appVersion`** para EAS Update (sigue la version de app.json).
3. **Build local con 4 arquitecturas** para compatibilidad maxima, aunque aumenta el tamano del APK.
4. **New Architecture activada** (`newArchEnabled: true`) desde el inicio.
5. **Plugin custom** para inyectar Google Maps API Key en `AndroidManifest.xml`.
6. **RLS con funcion `es_administrador()`** para politicas dinamicas basadas en rol.
7. **Trigger automatico** en `auth.users` para crear perfil con rol='ciudadano'.
8. **Reset de password con deep link** a `miprimeraapp://reset-password`.

---

## 11. PALETA DE COLORES

```js
primary:        "#0B6E4F"   // Verde institucional
primaryDark:    "#064E37"
primaryLight:   "#E6F4FE"
background:     "#F5F7FA"
surface:        "#FFFFFF"
textPrimary:    "#1A1A2E"
textSecondary:  "#6B7280"
estadoDisponible: "#10B981"
estadoPocas:    "#F59E0B"
estadoLlena:    "#EF4444"
estadoVacia:    "#9CA3AF"
success:        "#10B981"
warning:        "#F59E0B"
error:          "#EF4444"
border:         "#E5E7EB"
```

---

## 12. NEXT STEPS PENDIENTES

1. **Instalar APK en dispositivo fisico** y probar flujo completo:
   - Login como ciudadano
   - Registro de nuevo usuario
   - Recuperar password
   - Mapa, estaciones, reporte de incidencias
   - Login como administrador (redireccion a dashboard)
   - CRUD de estaciones
   - Gestion de incidencias (cambio de estado)

2. **Verificar EAS Update** descargando automaticamente al abrir la app.

3. **Crear usuario administrador** en Supabase Auth y asignar rol 'administrador'.

4. **(Opcional)** Reducir tamano del APK construyendo solo para arquitecturas necesarias (`arm64-v8a, armeabi-v7a`).

5. **(Opcional)** Implementar deep link handler para `miprimeraapp://reset-password` (pantalla para ingresar nueva password).

6. **(Opcional)** Agregar push notifications para nuevas incidencias.

7. **(Opcional)** Implementar foto en reporte de incidencias (ya hay `expo-image-picker` y columna `foto_url`).

---

## 13. COMANDOS UTILES

```bash
# Iniciar dev server
npx expo start

# Build local Android debug
npx expo run:android

# Build local Android release
npx expo run:android --variant release

# Prebuild limpio (regenera android/ios)
npx expo prebuild --clean

# Build EAS preview
npx eas build -p android --profile preview

# Publicar update
npx eas update --auto

# Ver updates publicados
npx eas update:list

# Lint
npx expo lint
```

---

## 14. CONTACTO / CUENTAS

- **Expo account:** dansld
- **Project:** bici-san-borja
- **EAS Dashboard:** https://expo.dev/accounts/dansld/projects/bici-san-borja
- **Supabase project:** vsvrfggfblozaelpnbhf

---

*Generado el: 2026-05-15*
*Ultimo commit: 8865bfc (actualizacion)*
*Estado: Build APK exitoso, pendiente prueba en dispositivo fisico*
