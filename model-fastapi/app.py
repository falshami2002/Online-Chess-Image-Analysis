from fastapi import FastAPI, UploadFile, File, HTTPException
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
    try: 
        contents = await file.read()
        img_array = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
        
        squares = divide.divideBoard(img)
        if len(squares) < 64:
            raise HTTPException(status_code=400, detail="Unable to detect full chessboard grid.")
        
        labels = predict.prediction(squares)
        if not labels or len(labels) != 64:
            raise HTTPException(status_code=400, detail="Model could not produce valid predictions.")
        
        fen = translate.toFEN(labels)
        return {"fen": fen, "ok": True}

    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
