import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# 1. Load dataset
df = pd.read_excel("SubscriptionUseCase_Dataset.xlsx")

# 2. Churn column
df["churn"] = df["Status"].map({"active": 0, "inactive": 1})

# 3. Simulate business features (since dataset lacks them)
np.random.seed(42)
df["MonthlyFee"] = np.random.choice([100, 200, 300, 500], size=len(df))
df["Usage"] = np.random.randint(10, 100, size=len(df))        # GB/month
df["Tenure"] = np.random.randint(1, 36, size=len(df))         # months subscribed

# 4. Feature set
features = ["MonthlyFee", "Usage", "Tenure"]
X = df[features]
y = df["churn"]

# 5. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 7. Train model
model = LogisticRegression(max_iter=500)
model.fit(X_train_scaled, y_train)

# 8. Discount recommender (corrected, with churn prob)
def recommend_discount(user, model, scaler, horizon=12, elasticity=0.5):
    # Keep user data as DataFrame with feature names to avoid warnings
    user_df = pd.DataFrame([user[features].values], columns=features)
    X_user = scaler.transform(user_df)
    churn_prob = model.predict_proba(X_user)[0, 1]

    best_discount, best_rev = 0, -1
    for d in [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]:
        churn_after = max(0, churn_prob - d * elasticity)
        paid = user["MonthlyFee"] * (1 - d)
        expected_rev = paid * ((1 - churn_after) * horizon)
        if expected_rev > best_rev:
            best_rev, best_discount = expected_rev, d

    return {
        "User Id": user["User Id"],
        "Churn Probability": round(churn_prob, 3),
        "Recommended Discount": best_discount
    }

# 9. Apply to all users
results = [recommend_discount(row, model, scaler) for _, row in df.iterrows()]
results_df = pd.DataFrame(results)

# 10. Save results
results_df.to_csv("user_discount_ml.csv", index=False)
results_df.to_excel("user_discount_ml.xlsx", index=False)

# 11. Preview
print("ML-based User Discount Recommendations Report Generated")
print(results_df.head(10))
