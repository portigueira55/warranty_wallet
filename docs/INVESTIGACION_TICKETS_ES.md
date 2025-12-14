# Investigación: Tickets de Compra en España

## Estructura Legal de Tickets Españoles

Según la normativa española (Royal Legislative Decree 1/2007), los tickets de compra (facturas simplificadas) deben contener:

### Elementos Obligatorios:
1. **NIF de la empresa** emisora
2. **Fecha y hora** de la operación
3. **Número de ticket único** (para control)
4. **Descripción de productos/servicios**:
   - Nombre del artículo
   - Cantidad
   - Precio unitario
   - Precio total por artículo
5. **IVA desglosado** (base imponible + tipo de IVA)
6. **Importe total** (con impuestos incluidos)

### Formatos Comunes:
- **Papel térmico** (en tienda física)
- **Digital/PDF** (compras online)
- **Email** como justificante de compra

---

## Análisis por Tienda

### MediaMarkt España
- **App propia** con tickets digitales desde 2016
- Programa de fidelización **miMediaMarkt** (1M+ miembros en 2024)
- Tickets accesibles online e in-store
- Garantía estándar según normativa

**Características:**
- Formato digital disponible
- Integración con programa de puntos
- Ticket físico + opción digital

### Worten España
- **100 días de satisfacción garantizada**
- Ticket/factura simplificada requerido para devoluciones
- 30 días para devoluciones online

**Requisitos para Garantía:**
- Ticket/factura de compra
- Producto completo con accesorios
- Sin signos de uso indebido
- Documento de identidad

### El Corte Inglés
- **Garantía legal**: 3 años (desde 01/01/2022), 2 años (antes)
- Emails como justificante de compra válido
- Formato: "This mail is your sales document"

**Formatos Aceptados:**
- Email de envío/entrega (impreso o en móvil)
- Factura electrónica (PDF)
- Ticket físico de tienda

---

## Patrones Comunes Detectados

### Estructura del Ticket:
```
[LOGO/NOMBRE TIENDA]
NIF: BXXXXXXXX
Dirección tienda

Fecha: DD/MM/YYYY  Hora: HH:MM
Ticket Nº: XXXXXXXXXX

----------------------------------------
ARTÍCULOS
----------------------------------------
Producto 1              Cant  P.Unit  Total
[Descripción]             X    XX.XX  XX.XX

Producto 2              Cant  P.Unit  Total
[Descripción]             X    XX.XX  XX.XX

----------------------------------------
Base Imponible:                   XX.XX€
IVA 21%:                          XX.XX€
----------------------------------------
TOTAL:                            XX.XX€
----------------------------------------

Método de pago: [Tarjeta/Efectivo/etc]

¡GRACIAS POR SU COMPRA!
Conserve este ticket para garantías
```

### Formatos de Fecha Comunes:
- `DD/MM/YYYY`
- `DD-MM-YYYY`
- `DD.MM.YYYY`
- Texto: "15 de enero de 2024"

### Formatos de Hora:
- `HH:MM`
- `HH:MM:SS`
- Con sufijo: `HH:MM h`

### Números de Ticket:
- Longitud: 6-10 dígitos
- Prefijos comunes: "Ticket:", "Nº:", "Ref:", "Factura:"
- Ejemplo: `2024110156789`

### Precios:
- Formato español: `XX,XX €`
- Con separador de miles: `1.234,56 €`
- Símbolo antes o después: `€ XX,XX` o `XX,XX €`

---

## Mejoras Recomendadas para OCR

### 1. Patrones Específicos para España:
- Detectar "Base Imponible", "IVA", "TOTAL"
- Reconocer formatos de precio españoles (coma decimal)
- Buscar NIF con formato español (letra inicial + 8 dígitos)

### 2. Palabras Clave Comunes:
- "Ticket", "Factura Simplificada"
- "Artículos", "Productos", "Total Artículos"
- "Forma de pago", "Tarjeta", "Efectivo"
- "Gracias por su compra"

### 3. Estructura de Tabla de Productos:
- Columnas: Descripción | Cant | P.Unit | Total
- Separadores: Líneas (---), espacios múltiples
- Alineación: Izquierda para nombre, derecha para números

### 4. Zonas del Ticket:
1. **Cabecera** (20% superior): Nombre tienda, NIF, dirección
2. **Metadatos** (siguiente 10%): Fecha, hora, número ticket
3. **Productos** (50% central): Tabla de artículos
4. **Totales** (15%): Subtotal, IVA, Total
5. **Pie** (5% inferior): Agradecimiento, notas

---

## Referencias

- [Normativa de Tickets en España - HelloCash](https://hellocash.es/blog/normativa-ticket-de-compra/25210)
- [Ticket de Compra - Status2](https://status2.com/ticket-compra-factura-simplificada/)
- [Qué es un Ticket de Compra - Quipu](https://getquipu.com/blog/ticket-de-compra/)
- [Garantía El Corte Inglés](https://www.elcorteingles.es/ayuda/es/devolucion-y-reembolso/garantia/)
- [Devoluciones Worten](https://www.worten.es/devoluciones)
- [MediaMarkt App - El Español](https://www.elespanol.com/elandroidelibre/aplicaciones/20160609/media-markt-presenta-aplicacion-tickets-digitales-compras/131237693_0.html)

---

## Casos de Uso Implementados

### Ticket 1: MediaMarkt
```
Producto: Samsung Galaxy A23
Fecha: 15/11/2024
Garantía: Hasta 15/11/2027
```

### Ticket 2: El Corte Inglés
```
Producto: Dell XPS 15
Fecha: 02/10/2023
Garantía: Hasta 02/10/2026 (3 años)
```

### Ticket 3: Worten
```
Producto: Bose QuietComfort 35 II
Fecha: 10/11/2020
Garantía: VENCIDA (10/11/2023)
```
