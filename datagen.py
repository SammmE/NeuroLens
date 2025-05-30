import csv
import math

NUM_ROWS = 20  # You can change this value as needed

with open('sin.csv', mode='w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['x', 'y'])
    for i in range(NUM_ROWS):
        x = i
        y = math.sin(x)
        writer.writerow([x, y])