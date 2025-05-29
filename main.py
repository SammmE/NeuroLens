import pandas as pd

data = pd.read_csv("sample.csv")

# add a new column with the number of the column
data["day"] = range(1, len(data) + 1)

# drop the date column
data = data.drop(columns=["Date"])

# make the day column the index
data = data.set_index("day")

# make the day column the first column
data = data.reset_index()

# save the modified data to a new csv file
data.to_csv("sample.csv", index=False)
