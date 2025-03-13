import sys
import os
# Suppress extra TensorFlow logging (set to '3' to show only errors)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers  # type: ignore
# from IPython.display import display  # not needed
# import matplotlib.pyplot as plt  # not needed for output
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, explained_variance_score


# Load datasets
df_file_path = "../csv/listing_info_200.csv"
utilities_file_path = "../csv/amenities_booleans.csv"

df = pd.read_csv(df_file_path, low_memory=False)
df_utilities = pd.read_csv(utilities_file_path, low_memory=False)

# Merge utilities data into main dataset using rentunit_id
df = df.merge(df_utilities[['rentunit_id', 'Utilities Incl']], on='rentunit_id', how='left')

# Fill missing values for utilities (assuming missing values mean not included)
df.fillna({'Utilities Incl': 0}, inplace=True)

# Select relevant columns
df_selected = df[['rentunit_id', 'rent', 'bedrooms_vacant', 'distance', 'lease_term', 'Utilities Incl']].copy()

# Fill missing values
df_selected.fillna({
    'rent': df_selected['rent'].median(),
    'bedrooms_vacant': df_selected['bedrooms_vacant'].median(),
    'distance': df_selected['distance'].median(),
    'lease_term': df_selected['lease_term'].mode()[0],
}, inplace=True)

# Convert lease terms to categorical values (one-hot encoding)
df_selected['lease_term'] = df_selected['lease_term'].astype(str)
df_selected = pd.get_dummies(df_selected, columns=['lease_term'], prefix='lease')

# Ensure all columns are numeric before training
df_selected = df_selected.apply(pd.to_numeric, errors='coerce')
df_selected.fillna(0, inplace=True)

# Normalize numerical features
scaler = StandardScaler()
df_selected[['rent', 'bedrooms_vacant', 'distance']] = scaler.fit_transform(df_selected[['rent', 'bedrooms_vacant', 'distance']])

# Define realistic ranges
min_rent, max_rent = 300, 1500
min_bedrooms, max_bedrooms = 1, 6
valid_lease_terms = ['4', '8', '12']

# Filter out unrealistic listings
df_realistic = df[
    (df['rent'].between(min_rent, max_rent)) &
    (df['bedrooms_vacant'].between(min_bedrooms, max_bedrooms)) &
    (df['lease_term'].astype(str).isin(valid_lease_terms))
]

# Prepare dataset for training
df_realistic_filtered = df_selected.loc[df_realistic.index].reset_index(drop=True)

# Convert to NumPy array with explicit float32 dtype
X_scaled = np.array(df_realistic_filtered.drop(columns=['rentunit_id']).values, dtype=np.float32)

# Train Neural Network for recommendations
model = keras.Sequential([
    layers.Input(shape=(X_scaled.shape[1],)),
    layers.Dense(64, activation='relu', kernel_regularizer=keras.regularizers.l2(0.01)),
    layers.Dense(32, activation='relu', kernel_regularizer=keras.regularizers.l2(0.01)),
    layers.Dense(X_scaled.shape[1], activation='linear')
])
model.compile(optimizer='adam', loss='mse')

def process_user_preferences(user_prefs_df):
    user_prefs_df[['rent', 'bedrooms_vacant', 'distance']] = scaler.transform(user_prefs_df[['rent', 'bedrooms_vacant', 'distance']])
    user_profile_vector = user_prefs_df.mean(axis=0).values.reshape(1, -1)
    return user_profile_vector

def recommend_houses_for_user(user_preferences_df):
    user_input_vector = process_user_preferences(user_preferences_df)
    user_embedding = model.predict(user_input_vector)
    distances = np.linalg.norm(X_scaled - user_embedding, axis=1)
    indices = np.argsort(distances)[:30]
    recommended_rentunit_ids = df_realistic.iloc[indices]['rentunit_id'].tolist()
    return json.dumps({"recommended_rentunit_ids": recommended_rentunit_ids})

# Example user preferences (for testing)
sample_user_prefs_data = {
    'rent': [600, 1000, 700],
    'bedrooms_vacant': [4, 5, 4],
    'distance': [1.5, 1.0, 0.8],
    'Utilities Incl': [1, 1, 1],
    'lease_term': ['12', '8', '4']
}
df_user_prefs_selected = pd.DataFrame(sample_user_prefs_data)
df_user_prefs_selected['lease_term'] = df_user_prefs_selected['lease_term'].astype(str)
df_user_prefs_selected = pd.get_dummies(df_user_prefs_selected, columns=['lease_term'], prefix='lease')
for col in df_realistic_filtered.columns:
    if col not in df_user_prefs_selected.columns and col != 'rentunit_id':
        df_user_prefs_selected[col] = 0
df_user_prefs_selected = df_user_prefs_selected[df_realistic_filtered.columns.drop('rentunit_id')]
df_user_prefs_selected = df_user_prefs_selected.astype(np.float32)

if __name__ == '__main__':
    # Get recommendations and output ONLY the JSON string.
    recommended_json = recommend_houses_for_user(df_user_prefs_selected)
    sys.stdout.write(recommended_json)
    sys.stdout.flush()
