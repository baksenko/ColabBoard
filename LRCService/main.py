# grpc_model_server.py
import grpc
from concurrent import futures
import ocr_pb2
import ocr_pb2_grpc

import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

MODEL_DIR = "saved_models/emnist_ocr"
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")
MODEL = None
LABELS = None

def load_model():
    global MODEL, LABELS
    MODEL = tf.keras.models.load_model(MODEL_DIR)
    with open(LABELS_PATH, 'r') as f:
        LABELS = json.load(f)
    print("Model and labels loaded. Num classes:", len(LABELS))

def preprocess_image_bytes(image_bytes):
    # Accept PNG/JPEG bytes. Convert to grayscale, resize to model input (28x28).
    img = Image.open(io.BytesIO(image_bytes)).convert('L')  # 'L' = grayscale
    # If your dataset expects 28x28:
    img = img.resize((28, 28), Image.Resampling.LANCZOS)
    arr = np.asarray(img).astype(np.float32) / 255.0
    # EMNIST might require transposition/rotation; adjust here if predictions are wrong orientation.
    arr = arr.reshape((1, 28, 28, 1))
    return arr

class OcrServiceServicer(ocr_pb2_grpc.OcrServiceServicer):
    def Predict(self, request, context):
        try:
            top_k = request.top_k if request.top_k and request.top_k > 0 else 1
            arr = preprocess_image_bytes(request.image)
            preds = MODEL.predict(arr)  # shape (1, num_classes)
            probs = preds[0]
            # Get top_k indices
            top_idx = np.argsort(probs)[::-1][:top_k]
            resp = ocr_pb2.PredictResponse()
            for idx in top_idx:
                label = LABELS[idx] if idx < len(LABELS) else str(idx)
                pred = ocr_pb2.Prediction(label=label, score=float(probs[idx]), class_index=int(idx))
                resp.predictions.append(pred)
            return resp
        except Exception as e:
            return ocr_pb2.PredictResponse(error=str(e))

def serve(port=50051):
    load_model()
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    ocr_pb2_grpc.add_OcrServiceServicer_to_server(OcrServiceServicer(), server)
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    print(f"gRPC Model server listening on {port}")
    server.wait_for_termination()

if __name__ == "__main__":
    serve(50051)