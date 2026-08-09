# Contribuir a public-apis-es

Gracias por querer aportar. Esta lista la mantiene la comunidad: cuantas más APIs, mejor. Tanto si es tu primer PR como si llevas años, todo suma.

## Qué puedes aportar

- **Añadir una API** que falte y sea gratuita.
- **Corregir** una URL caída, una descripción o el estado de auth/HTTPS/CORS.
- **Mejorar** el README, la documentación o los scripts.

## Añadir una API (el caso más común)

1. Añade la entrada al archivo [data/apis.json](data/apis.json), siguiendo exactamente este formato:

```json
{ "categoria": "Finanzas", "nombre": "Mi API", "url": "https://miapi.com/", "descripcion": "Qué hace, en una línea.", "auth": "No", "https": "Sí", "cors": "Sí" }
```

2. Regenera el README localmente:

```bash
node scripts/generate.mjs
```

3. Comprueba que la URL responde:

```bash
node scripts/check_links.mjs
```

4. Abre el PR. La validación y el chequeo de enlaces corren automáticamente en CI.

## Reglas

- Solo **APIs gratuitas** (con o sin clave gratis). Si pide pagar por empezar, no va.
- La URL debe ser la página oficial o de documentación de la API, no un sitio de terceros.
- La descripción en español, corta y clara.
- Campos válidos:
  - `auth`: `No`, `apiKey` u `OAuth`
  - `https`: `Sí` o `No`
  - `cors`: `Sí`, `No` o `Desconocido`
- Sin duplicados: busca antes si ya existe.

## Formato del commit

Mensajes claros, en imperativo y en español o inglés:

```
feat: añadir MyAPI a la categoría Finanzas
fix: actualizar URL de OldAPI (caída)
docs: mejorar la guía de contribución
```

## ¿Es tu primer PR?

Nada de miedo. El flujo básico:

```bash
# 1. Haz fork del repo y clónalo
git clone https://github.com/TU-USUARIO/public-apis-es.git
cd public-apis-es

# 2. Crea una rama
git checkout -b anadir/mi-api

# 3. Edita data/apis.json y regenera el README
node scripts/generate.mjs

# 4. Commit y push
git add .
git commit -m "feat: añadir Mi API"
git push origin anadir/mi-api

# 5. Abre el PR desde GitHub
```

Y listo: el CI te dirá si algo falla y cómo arreglarlo.
