import cv2
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Estado global de la cámara y predicción simulada
camera = None
is_camera_active = True
current_translation = "-"


def get_camera():
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
        # Configurar resolución estándar
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    return camera


def release_camera():
    global camera
    if camera is not None and camera.isOpened():
        camera.release()
        camera = None


def generate_frames():
    """Generador de frames en formato MJPEG desde la cámara web usando OpenCV."""
    global is_camera_active, current_translation

    while is_camera_active:
        cam = get_camera()
        success, frame = cam.read()
        if not success:
            break

        # Voltear horizontalmente (efecto espejo) para mayor comodidad del usuario
        frame = cv2.flip(frame, 1)

        # ------------------------------------------------------------------
        # AQUÍ SE INTEGRARÁ EL MODELO DE TRADUCCIÓN DE LENGUAJE DE SEÑAS
        # Ejemplo:
        # current_translation = modelo.predecir(frame)
        # ------------------------------------------------------------------

        # Codificar el frame en formato JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        frame_bytes = buffer.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
        )


@app.route('/video_feed')
def video_feed():
    """Endpoint que transmite el video de la cámara en tiempo real."""
    global is_camera_active
    is_camera_active = True
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/camera/toggle', methods=['POST'])
def toggle_camera():
    """Activa o desactiva la cámara web."""
    global is_camera_active
    data = request.get_json(silent=True) or {}
    if 'active' in data:
        is_camera_active = bool(data['active'])
    else:
        is_camera_active = not is_camera_active

    if not is_camera_active:
        release_camera()

    return jsonify({
        "status": "ok",
        "camera_active": is_camera_active
    })


@app.route('/api/translation', methods=['GET'])
def get_translation():
    """Devuelve la letra o palabra actual detectada por el modelo."""
    return jsonify({
        "current": current_translation,
        "camera_active": is_camera_active
    })


if __name__ == '__main__':
    try:
        print("Iniciando servidor Backend en http://localhost:5000 ...")
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    finally:
        release_camera()
