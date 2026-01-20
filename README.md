# Lucas - Tu Asistente Personal

Un asistente personal web (PWA) con avatar de gatito adorable. Interfaz minimalista en español, solo dark mode, con gestión de tareas, recordatorios con push notifications, y chat AI (GPT-4o-mini) capaz de gestionar tareas por lenguaje natural.

## Características

- **Dashboard**: Vista general con tareas de hoy, pendientes y calendario semanal
- **Tareas**: Crear, editar, completar tareas con prioridades, categorías y subtareas
- **Recordatorios**: Notificaciones push configurables
- **Chat con Lucas**: Asistente AI para gestionar tareas por lenguaje natural
- **PWA**: Instalable en móviles y escritorio
- **100% Offline-first**: Datos guardados localmente con IndexedDB

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Base de datos**: IndexedDB (Dexie.js)
- **AI**: OpenAI GPT-4o-mini con function calling
- **Animaciones**: Framer Motion

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd lucas-asistente

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local y agregar tu OPENAI_API_KEY

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

## Configuración

### API Key de OpenAI

Para usar el chat con Lucas, necesitas una API key de OpenAI:

1. Obtén una API key en [platform.openai.com](https://platform.openai.com)
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Agrega tu API key:

```bash
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### Notificaciones Push

Las notificaciones se activan desde Ajustes > Notificaciones. El navegador pedirá permiso la primera vez.

## Uso del Chat

Lucas puede entender comandos en lenguaje natural:

- "Crea una tarea para comprar leche mañana"
- "¿Qué tengo pendiente para hoy?"
- "Recuérdame llamar al médico mañana a las 10"
- "Completa la tarea de la leche"
- "Lista mis recordatorios"

## Estructura del Proyecto

```
src/
├── app/                    # Páginas y rutas
│   ├── api/chat/          # API para el chat con OpenAI
│   ├── tareas/            # Página de tareas
│   ├── recordatorios/     # Página de recordatorios
│   ├── chat/              # Chat con Lucas
│   └── ajustes/           # Configuración
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Sidebar, header, mobile nav
│   ├── tareas/            # Componentes de tareas
│   ├── recordatorios/     # Componentes de recordatorios
│   ├── chat/              # Interfaz de chat
│   ├── lucas/             # Avatar y animaciones de Lucas
│   └── dashboard/         # Widgets del dashboard
├── hooks/                 # Custom hooks (CRUD, chat)
├── lib/                   # Utilidades y configuración
│   ├── db.ts             # Schema de Dexie
│   ├── ai-functions.ts   # Funciones para OpenAI
│   └── notifications.ts  # Push notifications
└── types/                # TypeScript types
```

## PWA

La aplicación es una PWA instalable. Para instalarla:

1. Abre la app en Chrome/Edge/Safari
2. Busca la opción "Instalar" o "Agregar a pantalla de inicio"
3. La app funcionará como una aplicación nativa

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Lint
npm run lint

# Build
npm run build
```
