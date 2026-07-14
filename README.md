# LOGILINK

A desktop application built with **Electron**, **React**, **Vite**, and **Tailwind CSS**.

---

## Features

- 🔐 User Authentication
- 📊 Dashboard
- 📁 Local Database Support
- 🌙 Dark Mode
- 🔄 Automatic Updates
- 📄 PDF Export
- ⚡ Fast startup with Vite

---

## Tech Stack

- Electron
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Node.js

---

## Requirements

- Node.js 20+
- npm or yarn

Check your version:

```bash
node -v
npm -v
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/hagmir7/logilink.git
```

Go into the project

```bash
cd logilink
```

Install dependencies

```bash
npm install
```

---

## Development

Start Vite

```bash
npm run dev
```

Run Electron

```bash
npm run electron
```

Or if your project uses one command

```bash
npm run electron:dev
```

---

## Build

Build the React application

```bash
npm run build
```

Package Electron

```bash
npm run dist
```

or

```bash
npm run make
```

depending on your configuration.

---

## Project Structure

```
project/
│
├── electron/
│   ├── main.js
│   ├── preload.js
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── hooks/
│   ├── utils/
│
├── public/
├── package.json
└── vite.config.js
```

---

## Environment Variables

Create a `.env` file.

Example:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Scripts

| Command | Description |
|----------|-------------|
| npm run dev | Start Vite |
| npm run electron | Start Electron |
| npm run build | Build React |
| npm run dist | Package desktop app |
| npm run lint | Run ESLint |

---

## Screenshots

Add screenshots here.

```
screenshots/login.png
screenshots/dashboard.png
```

---

## Packaging

Windows

```bash
npm run dist
```

The installer will be generated in

```
release/
```

or

```
dist/
```

depending on your configuration.

---

## Troubleshooting

### Electron doesn't start

```bash
npm install
```

### Clear cache

```bash
rm -rf node_modules
npm install
```

Windows

```powershell
rmdir /s node_modules
npm install
```

---

## License

MIT

---

## Author

Your Name
