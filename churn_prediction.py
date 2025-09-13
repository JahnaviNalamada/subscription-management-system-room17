import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

# -------------------------------
# 1. Load Data
# -------------------------------
file_path = "SubscriptionUseCase_Dataset.xlsx"

users = pd.read_excel(file_path, sheet_name="User_Data")
subs = pd.read_excel(file_path, sheet_name="Subscriptions")
logs = pd.read_excel(file_path, sheet_name="Subscription_Logs")
billing = pd.read_excel(file_path, sheet_name="Billing_Information")

# -------------------------------
# 2. Create Churn Label
# -------------------------------
# Assumption: If subscription is 'Cancelled' in Subscriptions → churn = 1, else 0
subs['Churn'] = subs['Status'].apply(lambda x: 1 if str(x).lower() == "cancelled" else 0)

# -------------------------------
# 3. Feature Engineering
# -------------------------------

# (a) User total billing amount
billing_sum = billing.groupby("subscription_id")['amount'].sum().reset_index()
billing_sum.rename(columns={'amount': 'Total_Billing'}, inplace=True)

# (b) User total number of actions
log_actions = logs.groupby("Subscription id")['action'].count().reset_index()
log_actions.rename(columns={'action': 'Total_Actions'}, inplace=True)

# (c) User number of cancellations (from logs)
log_cancel = logs[logs['action'].str.lower() == 'cancel']
cancel_counts = log_cancel.groupby("Subscription id")['action'].count().reset_index()
cancel_counts.rename(columns={'action': 'Cancel_Count'}, inplace=True)

# Merge features with subscriptions
features = subs.merge(users, left_on="User Id", right_on="User Id", how="left")
features = features.merge(billing_sum, left_on="Subscription Id", right_on="subscription_id", how="left")
features = features.merge(log_actions, left_on="Subscription Id", right_on="Subscription id", how="left")
features = features.merge(cancel_counts, left_on="Subscription Id", right_on="Subscription id", how="left")

# Fill missing values
features.fillna(0, inplace=True)
# -------------------------------
# 4. Encode categorical columns
# -------------------------------
categorical_cols = features.select_dtypes(include=['object']).columns

le_dict = {}
for col in categorical_cols:
    le = LabelEncoder()
    features[col] = le.fit_transform(features[col].astype(str))
    le_dict[col] = le  # save encoders

# -------------------------------
# 5. Train/Test Split
# -------------------------------
X = features.drop(columns=["Churn", "User Id"])
y = features["Churn"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, stratify=y, random_state=42)

# -------------------------------
# 6. Train Model
# -------------------------------
clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# -------------------------------
# 7. Save Model & Scaler
# -------------------------------
joblib.dump(clf, "churn_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(le_dict, "label_encoders.pkl")

print("✅ Model training complete. Saved churn_model.pkl")
def predict_churn(user_id, features_df):
    # Load saved objects
    clf = joblib.load("churn_model.pkl")
    scaler = joblib.load("scaler.pkl")
    le_dict = joblib.load("label_encoders.pkl")
    
    # Extract user row
    user_row = features_df[features_df["User Id"] == user_id]
    if user_row.empty:
        return {
            "user_id": int(user_id),
            "error": "User Id not found in features dataframe."
        }
    X_user = user_row.drop(columns=["Churn", "User Id"])
    
    # Scale
    X_user_scaled = scaler.transform(X_user)
    
    # Predict probability
    proba = clf.predict_proba(X_user_scaled)[0]
    if len(clf.classes_) == 2:
        # Class 1 is "churn"
        prob = proba[1]
    else:
        # Only one class present, so probability of churn is 0 if class is 0, or 1 if class is 1
        prob = 1.0 if clf.classes_[0] == 1 else 0.0
    prediction = clf.predict(X_user_scaled)[0]
    
    return {
        "user_id": int(user_id),
        "churn_probability": round(prob, 3),
        "prediction": "Churn" if prediction == 1 else "Not Churn"
    }

# Example usage
print(predict_churn(10, features))

from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

clf = joblib.load("churn_model.pkl")
scaler = joblib.load("scaler.pkl")

@app.get("/churn_risk/{user_id}")
def churn_risk(user_id: int):
    user_row = features[features["User ID"] == user_id]
    if user_row.empty:
        return {"error": "User not found"}
    
    X_user = user_row.drop(columns=["Churn", "User ID"])
    X_scaled = scaler.transform(X_user)
    prob = clf.predict_proba(X_scaled)[0][1]
    prediction = clf.predict(X_scaled)[0]
    
    return {
        "user_id": user_id,
        "churn_probability": round(float(prob), 3),
        "prediction": "Churn" if prediction == 1 else "Not Churn"
    }
from datetime import datetime

# Use features and X_scaled already defined in notebook
# features: dataframe with all columns
# X_scaled: scaled features (numpy array)
# clf: trained model

proba = clf.predict_proba(X_scaled)
if proba.shape[1] == 2:
	features['Churn_Probability'] = proba[:, 1]
else:
	# Only one class present, so probability of churn is 0 if class is 0, or 1 if class is 1
	only_class = clf.classes_[0]
	features['Churn_Probability'] = np.where(only_class == 1, 1.0, 0.0)

features['Prediction'] = (features['Churn_Probability'] > 0.5).astype(int).map({1: "Churn", 0: "Not Churn"})
features['Date_Run'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Save to CSV
features[['User Id', 'Churn_Probability', 'Prediction', 'Date_Run']].to_csv("Churn_Predictions.csv", index=False)

print("✅ Batch churn predictions saved to Churn_Predictions.csv")
from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# -------------------------------
# Setup Logging
# -------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# -------------------------------
# Load Model and Preprocessing Objects
# -------------------------------
logging.info("Loading model, scaler, and label encoders...")
clf = joblib.load("churn_model.pkl")
scaler = joblib.load("scaler.pkl")
le_dict = joblib.load("label_encoders.pkl")

# Load or pass features dataframe here
features = pd.read_csv("Churn_Predictions.csv")  # Or load Excel as before
features.fillna(0, inplace=True)  # Ensure no NaNs

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="Churn Prediction API")

def preprocess_user_row(user_row: pd.DataFrame):
    """Preprocess a single user row before prediction"""
    X_user = user_row.drop(columns=["Churn", "User Id"], errors='ignore')
    
    # Encode categorical columns
    for col, le in le_dict.items():
        if col in X_user.columns:
            X_user[col] = le.transform(X_user[col].astype(str))
    
    # Scale
    X_scaled = scaler.transform(X_user)
    return X_scaled

@app.get("/churn_risk/{user_id}")
def churn_risk(user_id: int):
    # Find user
    user_row = features[features["User Id"] == user_id]
    if user_row.empty:
        logging.warning(f"User Id {user_id} not found")
        raise HTTPException(status_code=404, detail=f"User Id {user_id} not found")
    
    try:
        X_scaled = preprocess_user_row(user_row)
        proba = clf.predict_proba(X_scaled)[0][1] if len(clf.classes_) == 2 else (1.0 if clf.classes_[0] == 1 else 0.0)
        prediction = clf.predict(X_scaled)[0]
        
        response = {
            "user_id": int(user_id),
            "churn_probability": round(float(proba), 3),
            "prediction": "Churn" if prediction == 1 else "Not Churn",
            "date_run": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        logging.info(f"Prediction for User Id {user_id}: {response}")
        return response
    except Exception as e:
        logging.error(f"Error predicting churn for User Id {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
