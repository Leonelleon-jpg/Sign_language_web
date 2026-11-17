# Traductor de Lenguaje de Señas a Voz

Aplicación web con **Frontend en React (Vite)** y **Backend en Python (Flask + OpenCV)** para traducir lenguaje de señas en tiempo real.

## Estructura del Proyecto

```text
Project/
├── backend/
│   ├── app.py              # Servidor Flask que abre la cámara web con OpenCV
│   └── requirements.txt    # Dependencias de Python
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx         # Plantilla de la interfaz principal
        └── App.css         # Estilos de los frames y controles
```

## Cómo ejecutar el proyecto

### 1. Iniciar el Backend (Python)
En una terminal:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
El servidor quedará escuchando en `http://localhost:5000` y expondrá el stream de la cámara web en `http://localhost:5000/video_feed`.

### 2. Iniciar el Frontend (React)
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
Abre en el navegador `http://localhost:5173`.
