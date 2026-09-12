# Censos Arles

Panel administrativo para Vercel con Next.js y Firebase.

## Desarrollo
npm ci
npm run dev
npm run build
npm test

## Publicación
Importar este repositorio en Vercel como Next.js. Node 22, compilación npm run build y directorio de salida predeterminado.

Firebase mantiene Authentication y Firestore del proyecto inventario-censos-arles. La configuración cliente es pública; las reglas de Firestore exigen cuenta administrativa autorizada y correo verificado para consultar censos. No se incluyen credenciales privadas.

Las fichas completas se suman y exportan; los borradores se conservan y consultan por separado. El Excel mantiene el formato de floración y orden natural de lotes.
