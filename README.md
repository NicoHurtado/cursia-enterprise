# Cursia for Enterprises

Plataforma B2B para capacitación corporativa con creación de cursos asistida por IA y monitoreo detallado de progreso.

## Tecnologías

- **Next.js 15** con App Router y TypeScript
- **Prisma ORM** con PostgreSQL
- **NextAuth.js** para autenticación
- **React Query** para gestión de estado del servidor
- **Tailwind CSS** para estilos
- **Radix UI** para componentes accesibles
- **React Hook Form + Zod** para formularios y validación
- **TipTap** para editor de texto enriquecido

## Estructura del Proyecto

- **Panel de Administración** (`/admin`): CMS para crear y editar cursos
- **Dashboard del Cliente** (`/client`): Métricas y monitoreo de empleados
- **Vista del Empleado** (`/employee`): Interfaz para tomar cursos

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos y NEXTAUTH_SECRET
```

3. Configurar base de datos:
```bash
# Generar cliente de Prisma
npm run db:generate

# Crear/actualizar esquema de base de datos
npm run db:push

# Inicializar con usuario administrador
npm run db:init
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

**Credenciales iniciales del administrador:**
- Email: `admin@cursia.com`
- Contraseña: `admin123`

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer inicio de sesión.

## Roles de Usuario

- **ADMIN**: Equipo de Cursia - Crea y edita cursos
- **CLIENT**: RRHH/Jefes - Monitorean progreso de empleados
- **EMPLOYEE**: Empleados - Toman los cursos

## Características Principales

### Panel de Administración
- ✅ Gestor de estructura de cursos (módulos y lecciones)
- ✅ Editor de contenido enriquecido (TipTap)
- ✅ Gestión de media (videos y audios)
- ✅ Constructor de quizzes interactivos
- ✅ Constructor de flashcards
- ✅ Configuración de evaluación final

### Dashboard del Cliente
- ✅ Tabla de empleados con estado de progreso
- ✅ Métricas de progreso (% de avance)
- ✅ Tracking de tiempo en plataforma
- ✅ Promedio de notas en quizzes
- ✅ Resultados de evaluación final
- ✅ Exportación de reportes (CSV/PDF)

### Vista del Empleado
- ✅ Reproductor de cursos con tracking automático
- ✅ Visualización de lecciones con contenido enriquecido
- ✅ Quizzes interactivos con retroalimentación
- ✅ Flashcards para repaso
- ✅ Evaluación final con puntaje mínimo
- ✅ Certificados de completitud

