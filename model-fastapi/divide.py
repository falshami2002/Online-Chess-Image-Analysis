import cv2
import numpy as np

def divideBoard(im):
    # Resize image to uniform size
    img = cv2.resize(im, (640, 640))

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Binary image threshold
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)

    # Detect edges and dilate
    edges = cv2.Canny(thresh, 100, 200)
    kernel = np.ones((3, 3), np.uint8)
    dilation = cv2.dilate(edges, kernel, iterations=1)

    # Hough Lines P
    lines = cv2.HoughLinesP(dilation, 1, np.pi / 180, 100, None, 100, 10)

    # Get the list of x and y coordinates for each line
    x_coords = [x1 for line in lines for x1, y1, x2, y2 in [line[0]]]
    for line in lines:
        for x1, y1, x2, y2 in [line[0]]:
            x_coords.append(x2)
    y_coords = [y1 for line in lines for x1, y1, x2, y2 in [line[0]]]
    for line in lines:
        for x1, y1, x2, y2 in [line[0]]:
            y_coords.append(y2)

    # Sort the x and y coordinates
    x_coords = sorted(list(set(x_coords)))
    y_coords = sorted(list(set(y_coords)))

    # Create an array to store the sub-images
    sub_images = []

    # Divide the image into sub-images based on the lines
    for i in range(len(x_coords) - 1):
        for j in range(len(y_coords) - 1):
            x1, x2 = x_coords[i], x_coords[i+1]
            y1, y2 = y_coords[j], y_coords[j+1]
            sub_image = img[x1:x2, y1:y2]
            if x2 - x1 > 5 and y2 - y1 > 5:
                sub_images.append(sub_image)

    # Return array of sub_images
    return sub_images
