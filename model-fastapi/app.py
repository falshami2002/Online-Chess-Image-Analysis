from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2

import divide
import predict
import translate

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/predict")
async def predict_board(file: UploadFile = File(...)):
    contents = await file.read()
    img_array = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    squares = divide.divideBoard(img)
    labels = predict.prediction(squares)
    fen = translate.toFEN(labels)

    return {"fen": fen, "ok": True}
