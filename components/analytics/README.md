# Componentes de Analytics Optimizados

Este directorio contiene componentes optimizados para cargar scripts de terceros sin bloquear el renderizado inicial de la página.

## Meta Pixel

El componente `MetaPixel` carga el script de Facebook Pixel de forma asíncrona después de que la página sea interactiva, mejorando significativamente el tiempo de carga inicial.

### Configuración

1. Agrega tu Meta Pixel ID a las variables de entorno:

```env
NEXT_PUBLIC_META_PIXEL_ID=tu_pixel_id_aqui
```

2. El componente se carga automáticamente en el layout principal si está configurado.

### Estrategia de Carga

- **Estrategia**: `afterInteractive` - El script se carga después de que la página sea interactiva
- **No bloquea**: El renderizado inicial de la página
- **Fallback**: Incluye un noscript tag para cuando JavaScript está deshabilitado

## Calendly Widget

El componente `CalendlyWidget` carga el widget de Calendly solo cuando es necesario, usando lazy loading.

### Características

- Carga el script de Calendly solo cuando el componente se monta
- Usa `lazyOnload` para cargar el script después de otros recursos críticos
- El iframe tiene `loading="lazy"` para mejorar el rendimiento

## External Scripts

El componente `ExternalScripts` centraliza la carga de todos los scripts externos y agrega preconnect/dns-prefetch para mejorar los tiempos de carga.
