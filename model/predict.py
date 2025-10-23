import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras.preprocessing.image import ImageDataGenerator

def prediction(imgs):

    images = imgs
    # Rescale images
    images = [cv2.cvtColor(image, cv2.COLOR_BGR2RGB) for image in images]
    images = [cv2.resize(image, (64, 64)) for image in images]
    images = [image.astype('float32') / 255 for image in images]
    images = np.stack(images)
    # Load the model
    model = keras.models.load_model('model.h5')
    # Predict
    predictions = model.predict(images)
    labels = []
    for p in predictions:
        label = np.argmax(p)
        labels.append(label)
    return labels
