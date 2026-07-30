# API pública — parámetros y eventos

Endpoints PHP que devuelven **JSON** (`Content-Type: application/json; charset=utf-8`). Ambos leen el cuerpo de la petición con **`php://input`**: hay que enviar el cuerpo como **JSON** (normalmente con método **POST**).

Rutas relativas al proyecto (ejemplo en XAMPP):

- Parámetros: `https://tu-dominio/agendainstitucional/api/api_parametros.php`
- Eventos: `https://tu-dominio/agendainstitucional/api/api_public.php`

---

## `api_parametros.php`

Catálogos para armar filtros o listas (repositorios, entidades, categorías). No requiere fechas.

### Petición

| Aspecto | Valor |
|--------|--------|
| Método recomendado | `POST` |
| Cabecera | `Content-Type: application/json` |
| Cuerpo | Objeto JSON con la propiedad `consulta` |

### Campo `consulta`

Valor de texto (sin espacios extra al inicio/final). Solo se aceptan estos tres:

| `consulta` | Respuesta incluye |
|------------|-------------------|
| `repositorios` | `repositorios[]` con `idRepositorio`, `nombreRepositorio`, `descripcionRepositorio` |
| `entidades` | `entidades[]` con `idEntidad`, `nombreEntidad`, `descripcionEntidad` |
| `categorias` | `categorias[]` con `idCategoria`, `nombreCategoria`, `descripcionCategoria` |

Los listados vienen ordenados por nombre ascendente.

### Ejemplo: listar repositorios

```http
POST /agendainstitucional/api/api_parametros.php
Content-Type: application/json

{"consulta":"repositorios"}
```

### Respuestas

**Éxito** (según el tipo de consulta):

```json
{
  "success": true,
  "repositorios": [ ... ]
}
```

(análogo con `entidades` o `categorias`).

**Sin cuerpo o cuerpo vacío** (`success: false`, `mensaje: "No se recibieron datos"`, arrays vacíos).

**`consulta` inválida o ausente** (`success: false`, mensaje indicando que debe ser `repositorios`, `entidades` o `categorias`).

---

## `api_public.php`

Consulta de **eventos** en un rango de fechas, con filtros opcionales por repositorio, entidad y categoría. Enriquece cada evento con datos relacionados (categoría, repositorio, unidad, personal, entidad, contacto, usuario de registro, fotografías con URL absoluta, equipamiento).

### Petición

| Aspecto | Valor |
|--------|--------|
| Método recomendado | `POST` |
| Cabecera | `Content-Type: application/json` |
| Cuerpo | Objeto JSON (ver tabla) |

### Campos del JSON

| Campo | Obligatorio | Formato / notas |
|-------|-------------|-----------------|
| `fecha_inicio` | Sí | `YYYY-MM-DD`, fecha válida |
| `fecha_fin` | Sí | `YYYY-MM-DD`, fecha válida; debe ser **≥** `fecha_inicio` |
| `idRepositorio` | No | Entero; **`0` = no filtrar** por repositorio |
| `idEntidad` | No | Entero; **`0` = no filtrar** por entidad |
| `idCategoria` | No | Entero; **`0` = no filtrar** por categoría |

Se filtran eventos cuyo campo `fecha` cumple: `fecha_inicio` ≤ `fecha` ≤ `fecha_fin`, más las condiciones de los IDs distintos de `0`.

### Ejemplo: todos los eventos de abril 2026

```http
POST /agendainstitucional/api/api_public.php
Content-Type: application/json

{
  "fecha_inicio": "2026-04-01",
  "fecha_fin": "2026-04-30",
  "idRepositorio": 0,
  "idEntidad": 0,
  "idCategoria": 0
}
```

### Ejemplo: filtrar por repositorio y categoría

```json
{
  "fecha_inicio": "2026-01-01",
  "fecha_fin": "2026-12-31",
  "idRepositorio": 2,
  "idEntidad": 0,
  "idCategoria": 5
}
```

### Respuesta exitosa con datos

```json
{
  "success": true,
  "eventos": [ /* array de objetos evento */ ]
}
```

Cada elemento de `eventos` incluye, entre otros:

- Datos del evento: `idEvento`, `fecha`, `horaInicio`, `horaFin`, `descripcion`, `lugar`, `objetivoEsperado`, `observaciones`, `color`, `participantes`, `fechaRegistro`, `horaRegistro`, `estado`, `obsConclusion`.
- Objetos anidados: `categoria`, `repositorio`, `unidad`, `personal`, `entidad`, `contacto`, `usuarioRegistro`.
- `fotografias`: array de `{ "idFotografia", "pathFotografia" }`. El campo **`pathFotografia`** se devuelve como **URL absoluta** del mismo sitio (si en base de datos era una ruta relativa tipo `../../storage/...`, se normaliza respecto a la raíz del documento y al subdirectorio del proyecto).
- `equipamiento`: ítems con datos del equipamiento y cantidades solicitadas.

El orden de los eventos es por **`fecha` descendente**.

### Sin resultados

```json
{
  "success": true,
  "eventos": [],
  "mensaje": "No se encontraron eventos"
}
```

### Errores

| Situación | `success` | Notas |
|-----------|-----------|--------|
| JSON mal formado | `false` | `mensaje` incluye el error de `json_last_error_msg()` |
| Sin datos o no es un objeto/array | `false` | Indica enviar `fecha_inicio`, `fecha_fin`, IDs (`0` = sin filtrar) |
| Fechas faltantes o formato distinto de `YYYY-MM-DD` | `false` | — |
| `fecha_inicio` > `fecha_fin` | `false` | — |

En errores, la respuesta incluye `eventos: []`.

---

## Ejemplo con `fetch` (JavaScript)

```javascript
// Parámetros: repositorios
const resRepo = await fetch('/agendainstitucional/api/api_parametros.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ consulta: 'repositorios' }),
});
const dataRepo = await resRepo.json();

// Eventos en rango
const resEvt = await fetch('/agendainstitucional/api/api_public.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fecha_inicio: '2026-04-01',
    fecha_fin: '2026-04-30',
    idRepositorio: 0,
    idEntidad: 0,
    idCategoria: 0,
  }),
});
const dataEvt = await resEvt.json();
```

Ajusta la URL base según dónde esté publicada la aplicación.

---

## Dependencias

Ambos scripts incluyen `../config_agenda_db.php` (conexión MySQLi). La disponibilidad y el contenido dependen de la base de datos configurada en ese archivo.
