# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9f530485-2c13-4005-be33-593ab2d83389

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9f530485-2c13-4005-be33-593ab2d83389) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9f530485-2c13-4005-be33-593ab2d83389) and click on Share -> Publish.

### Deploy to DonWeb VPS

Este proyecto incluye un workflow de GitHub Actions para desplegar automáticamente en una VPS de DonWeb.

#### Configuración de Secrets en GitHub

Para que el workflow funcione, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

1. Ve a **Settings** > **Secrets and variables** > **Actions** en tu repositorio de GitHub
2. Agrega los siguientes secrets:

   - `VPS_HOST`: La IP o dominio de tu VPS (ej: `123.456.789.0` o `mi-servidor.donweb.com`)
   - `VPS_USER`: El usuario SSH (ej: `root` o `deploy`)
   - `VPS_SSH_KEY`: Tu clave privada SSH completa (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`)
   - `VPS_PORT`: Puerto SSH (opcional, por defecto 22)
   - `VPS_DEPLOY_PATH`: Ruta donde se desplegarán los archivos en el servidor (ej: `/var/www/html` o `/home/usuario/app/dist`)

#### Generar clave SSH

Si no tienes una clave SSH, puedes generarla con:

```sh
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

Luego copia la clave pública a tu servidor:

```sh
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@tu-servidor
```

Y agrega la clave privada (`~/.ssh/id_ed25519`) como secret `VPS_SSH_KEY` en GitHub.

#### Ejecución

El workflow se ejecuta automáticamente cuando:
- Haces push a las ramas `main` o `master`
- O manualmente desde la pestaña **Actions** en GitHub

#### Notas

- Asegúrate de que el usuario SSH tenga permisos de escritura en `VPS_DEPLOY_PATH`
- Si usas Nginx u otro servidor web, descomenta y ajusta el paso de reinicio en el workflow
- El workflow elimina los archivos antiguos antes de subir los nuevos (`rm_old: true`)

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
