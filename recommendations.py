import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity

# ----------------- Step 1: Load all sheets -----------------
file_path = "SubscriptionUseCase_Dataset.xlsx"
all_sheets = pd.read_excel(file_path, sheet_name=None)  # read all sheets
df = pd.concat(all_sheets.values(), ignore_index=True)

print("✅ Dataset loaded successfully!")
print("Columns available:", df.columns.tolist())


df = df.fillna("")


exclude_cols = ['User Id', 'Subscription Id', 'subscription_id', 'Product Id',
                'Phone', 'Email', 'Start Date', 'Last Billed Date', 'Last Renewed Date',
                'Terminated Date', 'action date', 'billing_date', 'Unnamed: 5', 'Unnamed: 6']

similarity_cols = [col for col in df.columns if col not in exclude_cols]


label_encoders = {}
for col in similarity_cols:
    if df[col].dtype == 'object':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le


if len(similarity_cols) == 0:
    raise ValueError("No columns available for similarity computation!")

similarity_matrix = cosine_similarity(df[similarity_cols])


def recommend_plans(user_plan, top_n=5):
    if user_plan not in df["Name"].values:
        print(f"⚠️ Plan '{user_plan}' not found in dataset!")
        return
    
    
    plan_indices = df.index[df["Name"] == user_plan].tolist()
    
    
    sim_scores = similarity_matrix[plan_indices].mean(axis=0)
    
   
    top_indices = sim_scores.argsort()[::-1]
    top_indices = [i for i in top_indices if df.iloc[i]["Name"] != user_plan][:top_n]
    
    recommended_plans = df.iloc[top_indices]["Name"].unique()
    
    print(f"\n📌 Recommended plans similar to '{user_plan}':")
    for rp in recommended_plans:
        print("👉", rp)

# ----------------- Step 6: Show available plans -----------------
available_plans = df["Name"].unique()
print("\n✅ Available Plans to choose from:")
for p in available_plans:
    print("-", p)

# ----------------- Step 7: Get user input -----------------
user_plan = input("\nEnter the plan name you are interested in: ").strip()

# Convert numeric plan names if necessary
try:
    user_plan = int(user_plan)
except ValueError:
    pass

recommend_plans(user_plan, top_n=5)
