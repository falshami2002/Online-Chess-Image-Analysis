import divide
import cv2
import predict
import translate
import sys

img_path = sys.argv[1]
img = cv2.imread(img_path)
images = divide.divideBoard(img)
labels = predict.prediction(images)
fen = translate.toFEN(labels)

print(fen)