Importador de Productos desde XML - TRY

Este proyecto permite importar productos automáticamente desde el feed XML de (https://try.com.ar/wp-content/uploads/woo-feed/google/xml/hardgamers.xml) y cargarlos en Firebase Firestore, clasificados por categoría.

¿Qué hace este script?

- Lee el XML de productos actualizado de TRY.
- Clasifica cada producto según su tipo (`procesador`, `ssd`, `fuente`, etc).
- Si el producto ya existe en Firebase:
  - Actualiza el precio si cambió.
  - Informa si el precio es igual.
- Si el producto no existe:
  -  Lo agrega como nuevo.
- Si no tiene los datos necesarios o no entra en una categoría válida:
  -  Lo ignora con aviso en consola.

-----------------------------------------------------------------------

Tecnologías usadas

- Node.js
- Axios
- xml2js
- Firebase Admin SDK

-----------------------------------------------------------------------

Instalación

1. Cloná el repositorio:

git clone https://github.com/TU_USUARIO/importador-try.git
cd importador-try

2. Cloná el repositorio:
npm install

3. Colocá tu archivo serviceAccountKey.json en la raíz del proyecto.

-----------------------------------------------------------------------
   
Uso 

ejecuta:

node importar.js

El script procesará los productos y los agrupará en Firestore bajo:

productos_try/{categoria}/items/{id}

-----------------------------------------------------------------------

Seguridad

Asegurate de que tu archivo .gitignore incluya:

node_modules/
serviceAccountKey.json

Esto evita subir dependencias y credenciales privadas.

-----------------------------------------------------------------------

 Autor

 Proyecto creado por Marcelo Arce para uso educativo

