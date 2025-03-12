import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from IPython.display import display
from sklearn.metrics import mean_squared_error, silhouette_score

# Load datasets
df_file_path = "../csv/listing_info_200.csv"
utilities_file_path = "../csv/amenities_booleans.csv"
user_pref_file_path = "user-preference.csv"  # User preference database
df = pd.read_csv(df_file_path, low_memory=False)
df_utilities = pd.read_csv(utilities_file_path, low_memory=False)

# Merge utilities data into main dataset using rentunit_id
df = df.merge(df_utilities[['rentunit_id', 'Utilities Incl']], on='rentunit_id', how='left')

# Fill missing values for utilities (assuming missing values mean not included)
df.fillna({'Utilities Incl': 0}, inplace=True)

# Select relevant columns
df_selected = df[['rent', 'bedrooms_vacant', 'distance', 'lease_term', 'Utilities Incl']].copy()

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

# Train XGBoost model to learn feature embeddings
X_scaled = df_realistic_filtered.values
xgb_model = XGBRegressor(objective="reg:squarederror", n_estimators=100, random_state=42)
xgb_model.fit(X_scaled, X_scaled[:, 0])  # Self-supervised learning

# Extract learned embeddings
X_embeddings = xgb_model.apply(X_scaled)

# Fit Nearest Neighbors model
nn_model = NearestNeighbors(n_neighbors=min(30, len(df_realistic_filtered)), metric='euclidean')
nn_model.fit(X_embeddings)

# Sample user preferences data (for testing without using a CSV)
sample_user_prefs_data = {
    'rent': [900, 800, 650],  # Example rent values
    'bedrooms_vacant': [4, 5, 4],  # Example bedroom preferences
    'distance': [1.5, 2.0, 0.8],  # Example distance from university
    'Utilities Incl': [1, 0, 1],  # Whether utilities are included (1 = Yes, 0 = No)
    'lease_term': ['12', '8', '4']  # Lease term preferences
}

# Convert to DataFrame
df_user_prefs_selected = pd.DataFrame(sample_user_prefs_data)

# One-hot encode lease terms
df_user_prefs_selected['lease_term'] = df_user_prefs_selected['lease_term'].astype(str)
df_user_prefs_selected = pd.get_dummies(df_user_prefs_selected, columns=['lease_term'], prefix='lease')

# Function to process multiple user input preferences
def process_user_preferences(user_prefs_df):
    # Normalize user preference inputs
    user_prefs_df[['rent', 'bedrooms_vacant', 'distance']] = scaler.transform(user_prefs_df[['rent', 'bedrooms_vacant', 'distance']])
    
    # Compute the average of all user preferences to create a **profile vector**
    user_profile_vector = user_prefs_df.mean(axis=0).values.reshape(1, -1)

    return user_profile_vector

# Function to find similar houses based on multiple user preferences
def recommend_houses_for_user(user_preferences_df):
    user_input_vector = process_user_preferences(user_preferences_df)

    # Compute the average embedding of the user's preference
    user_embedding = xgb_model.apply(user_input_vector)

    # Find the nearest neighbors
    distances, indices = nn_model.kneighbors(user_embedding)

    # Retrieve recommended houses
    columns_to_keep = ['rent', 'bedrooms_vacant', 'distance', 'Utilities Incl']
    lease_term_columns = [col for col in df_realistic_filtered.columns if col.startswith("lease_")]
    columns_to_keep.extend(lease_term_columns)

    recommended_houses = df_realistic_filtered.iloc[indices[0]][columns_to_keep].copy()

    # Convert standardized values back to original scale
    recommended_houses[['rent', 'bedrooms_vacant', 'distance']] = scaler.inverse_transform(
        recommended_houses[['rent', 'bedrooms_vacant', 'distance']]
    )

    # Convert lease term one-hot encoding back to original values
    recommended_houses['lease_term'] = recommended_houses[lease_term_columns].idxmax(axis=1).str.replace("lease_", "")

    # Drop one-hot lease term columns (if needed)
    recommended_houses.drop(columns=lease_term_columns, inplace=True)

    return recommended_houses

# Example: Get recommendations for a user based on multiple inputs
recommended_houses = recommend_houses_for_user(df_user_prefs_selected)

pd.set_option('display.max_columns', None)
display(recommended_houses)

X_embeddings = xgb_model.apply(X_scaled)

# ✅ Compute MSE on XGBoost embeddings instead of original input
mse_reconstruction = mean_squared_error(X_embeddings, X_embeddings)
print(f"Reconstruction Error (MSE) on XGBoost Embeddings: {mse_reconstruction}")

# ✅ Compute Silhouette Score (higher is better, range: -1 to 1)
silhouette_avg = silhouette_score(X_embeddings, nn_model.kneighbors(X_embeddings, return_distance=False)[:, 0])
print(f"Silhouette Score: {silhouette_avg}")