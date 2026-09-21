---
title: Guia de desarrollo del sitio web
icon: laptop-code
pageInfo: false
index: true
order: 5
---

Bienvenido a participar en el proyecto de codigo abierto del sitio web de "PvZ2 Gardendless". Tanto si eres principiante como desarrollador con experiencia, te animamos a aportar codigo, reportar issues o compartir sugerencias.
Abajo tienes una guia breve para que usuarios sin experiencia puedan participar rapidamente.

## 1. Preparacion

Antes de empezar, completa algunas configuraciones basicas. En `Windows` recomendamos usar `PowerShell` dentro de `Windows Terminal` para ejecutar comandos.

### 1.1 Instalar VScode, Git y Node.js

#### VScode

VScode es un editor ligero que soporta varios lenguajes. Para este proyecto recomendamos usar VScode.

- Descarga e instala VScode: [Sitio oficial de VScode](https://code.visualstudio.com/)
- Lee la [documentacion de VScode](https://code.visualstudio.com/docs) para conocer su uso.
- Plugins recomendados: `Vue - Official`, `ESLint`, `GitLens`, etc.

#### Git

Git es una herramienta para gestionar versiones. La usaremos para clonar, actualizar y enviar cambios.

- Descarga e instala Git: [Sitio oficial de Git](https://git-scm.com/). En Windows se recomienda `64-bit Git for Windows Setup`.
- Durante la instalacion puedes usar opciones por defecto.
- Recomendado: `Use Visual Studio Code as Git's default editor`.
- Recomendado: `Git from the command line and also from 3rd-party software`.
- Tras instalar, ejecuta este comando para confirmar:

```bash
git --version
```

#### Node.js

VuePress es un generador de sitios estaticos basado en Node.js, por eso necesitas instalar Node.js.

- Descarga e instala Node.js: [Sitio oficial de Node.js](https://nodejs.org/)
- Tras instalar, ejecuta para verificar:

```bash
node --version
npm --version
```

### 1.2 Instalar Corepack

Corepack ayuda a instalar y gestionar gestores de paquetes del proyecto.

- Ejecuta el siguiente comando para activarlo:

```bash
corepack enable
```

## 2. Hacer fork del proyecto

### 2.1 Crear una cuenta de GitHub

Antes de participar, necesitas una cuenta de GitHub.

### 2.2 Realizar el fork

Para contribuir en GitHub, haz fork (una copia del proyecto en tu cuenta) para trabajar sobre tu repositorio.

1. Visita el proyecto [pvzg_site](https://github.com/Gzh0821/pvzg_site).
2. Pulsa `Fork` arriba a la derecha para copiar el proyecto a tu cuenta.
3. Entra en tu repositorio forkeado.

## 3) Clonar el proyecto en local

Despues del fork, clona el codigo en tu equipo local. `VScode` permite clonar repositorios, o puedes usar terminal:

1. Abre una terminal. En Windows usa `Windows Terminal` o la terminal integrada de `VScode`.

2. En la ruta donde quieras guardar el proyecto, ejecuta:

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
```

Reemplaza `YOUR_USERNAME` por tu usuario de GitHub.

3. Entra en el directorio del proyecto, donde debe existir `package.json`:

```bash
cd pvzg_site
```

4. Abre el directorio con `VScode`. Desde ahi puedes ejecutar comandos y editar archivos:

```bash
code .
```

## 4. Instalar dependencias

Tras entrar al directorio del proyecto, instala las dependencias necesarias. Todos los comandos siguientes deben ejecutarse dentro de este directorio.

- Usa `Corepack` para instalar `pnpm`, y luego instala dependencias con `pnpm`:

```bash
corepack install
# Verifica si pnpm esta disponible en el proyecto
pnpm -v
# Instala dependencias
pnpm install
```

## 5. Ejecutar el entorno de desarrollo

Tras instalar dependencias, puedes iniciar el entorno de desarrollo y ver el sitio en local.

- Usa este comando para iniciar el servidor de desarrollo:

```bash
pnpm docs:dev
```

Cuando inicie correctamente, abre `http://localhost:8080` en tu navegador.

## 6. Empezar a editar

Ahora ya puedes modificar y mejorar el codigo.

### 6.1 Markdown file

Markdown es un lenguaje de marcado ligero. Puedes aprender mas en [Markdown Guide](https://www.markdownguide.org/).

El contenido de las paginas esta escrito principalmente en Markdown (`.md`). Los archivos estan en el directorio `src`.

Este proyecto usa `Vuepress`. Consulta la [documentacion oficial de Vuepress](https://vuepress.vuejs.org/).

El formato de los archivos `.md` es el siguiente:

```markdown
<!-- Configuracion -->
---
title: titulo de la pagina
index: false
...
---
<!-- Componentes HTML -->
<script />
<Catalog />

> [!info]
> informacion aqui...

### Titulo

Contenido...
```

### 6.2 Aportar traducciones

Dentro de `src` encontraras el directorio `en`, que contiene las paginas en ingles. Puedes usar esos archivos como referencia para traducir a otros idiomas.

Para traducir, solo modifica archivos `.md` del idioma correspondiente (por ejemplo `ru-RU`, `pt-BR`). Debes mantener la misma estructura y nombres de archivo que en `en`.

En la configuracion del `.md`, normalmente solo necesitas traducir `title`; los componentes `HTML` pueden dejarse igual.
Se recomienda revisar continuamente que la pagina se vea bien durante la edicion.

## 7. Enviar cambios y abrir un Pull Request

Cuando termines los cambios y todo funcione, puedes enviar tus cambios y crear un Pull Request.

### 7.1 Hacer commit y push a GitHub

Recomendamos usar `VScode`. Completa el mensaje en `Source Control`, haz commit y luego sincroniza cambios.

Para enviar por terminal:

1. Agrega los cambios a Git:

```bash
git add .
```

2. Crea el commit:

```bash
git commit -m "Describe your changes"
```

3. Sube tus cambios al repositorio remoto:

```bash
git push origin main
```

### 7.2 Abrir Pull Request

1. Ve a la pagina de tu repositorio en GitHub.
2. Pulsa `Compare & pull request`.
3. Completa la descripcion y envia el Pull Request.

Revisaremos tu Pull Request lo antes posible y daremos feedback o fusionaremos cuando corresponda.

## 8. Enviar Issues

Si encuentras problemas durante el desarrollo, puedes reportarlos en Issues de GitHub.

1. Visita la [pagina de Issues](https://github.com/Gzh0821/pvzg_site/issues) del proyecto.

2. Pulsa el boton `New issue`.

3. Describe el problema y envia.

## 9) Participar en discusiones

Damos la bienvenida a todos los usuarios para participar en las discusiones del proyecto. Puedes comunicarte con nosotros de estas formas:

- Participar en Discussions de GitHub.

- Participar en el servidor de Discord.

Gracias por tu apoyo y contribucion. Esperamos colaborar contigo para mejorar este proyecto.