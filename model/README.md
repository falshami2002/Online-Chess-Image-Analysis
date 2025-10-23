# chess-ai
Turn an image of a chess position into a FEN string for analysis engines

This is my first python project. Currently the program takes in an image of a digital chess position and mainpulates
the image using opencv methods to divide it into the 64 individual squares. A CNN then takes thosse 64 images and 
recognizes it as empty or as being occupied by a piece and recognizes the type and color of piece. Based on those
predicted labels, the program then converts that information to FEN (Forsyth–Edwards Notation) which can be 
plugged into any chess analysis board to analyze the position.
