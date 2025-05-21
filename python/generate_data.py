from faker import Faker
import pandas as pd
import random
from datetime import datetime, timedelta
import os
import json

random.seed(42)
# Get the project root directory (NewWeb)
current_dir = os.path.dirname(os.path.abspath(__file__))  # Gets python directory
project_root = os.path.dirname(current_dir)  # Gets NewWeb directory
data_dir = os.path.join(project_root, "data")  # Gets data directory

# Create data directory if it doesn't exist
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

Faker.seed(42)
f = Faker("he_IL")
dataAmountAgents = 20
dataAmountTransactions = 80

# Generate data
agent_ids = [f"{f.user_name()}_{f.random_int(min=1000, max=9999)}" for _ in range(dataAmountAgents)]
addresses = [f.address() for _ in range(dataAmountAgents)]
random_ints = [f.random_int(min=1, max=3) for _ in range(dataAmountAgents)]

# Add 'Citizens' group
agent_ids.insert(0, "Citizens")
addresses.insert(0, None)
random_ints.insert(0, 4)
agent_ids.insert(1, "Disposel")
addresses.insert(1, "Hiria")
random_ints.insert(1, 5)

# Create DataFrame
Agents_df = pd.DataFrame({
    "AgentID": agent_ids,
    "Address": addresses,
    "Type": random_ints
})

# Save DataFrame
agents_file_path = os.path.join(data_dir, "generated_data_agents.xlsx")
Agents_df.to_excel(agents_file_path, index=False)
print(f"Agents data saved to: {agents_file_path}")

########################################################################################################################

# Initialize transaction counter
transaction_counter = 1000

# Function to generate unique transaction IDs
def generate_transaction_id():
    global transaction_counter
    transaction_counter += 1
    return f"TXN{transaction_counter}"

# Define seller and buyer groups
sellers_df = Agents_df[Agents_df["Type"].isin([1, 2, 3])]  # Sellers: Type 1, 2, 3
buyers_df = Agents_df[Agents_df["Type"].isin([2, 3, 4, 5])]  # Buyers: Type 2, 3, 4, 5

# Ensure valid sellers and buyers exist
if sellers_df.empty or buyers_df.empty:
    raise ValueError("No valid sellers or buyers based on the defined conditions!")

# Load product codes from random_records.json
with open(os.path.join(current_dir, '../data/random_records.json'), 'r', encoding='utf-8') as product_file:
    products_data = json.load(product_file)
    product_codes = [str(product['Code']) for product in products_data]

# Generate transaction data
transactions = []

for _ in range(dataAmountTransactions):
    buyer = random.choice(buyers_df["AgentID"].tolist())
    buyer_type = Agents_df.loc[Agents_df["AgentID"] == buyer, "Type"].values[0]

    if buyer_type == 4:  # If buyer is Type 4, seller must be Type 3
        possible_sellers = sellers_df[sellers_df["Type"] == 3]["AgentID"].tolist()
    else:  # Otherwise, seller can be Type 1, 2, or 3
        possible_sellers = sellers_df["AgentID"].tolist()

    # Ensure seller is not the same as the buyer
    possible_sellers = [seller for seller in possible_sellers if seller != buyer]

    if not possible_sellers:
        continue  # Skip if no valid seller

    seller = random.choice(possible_sellers)
    DT = f.date_time_this_decade()
    
    # Generate Created_at between 1 and 365 days before DT
    days_before = random.randint(1, 365)
    Created_at = DT - timedelta(days=days_before)
    
    # Generate Status (90% Approved, 10% Rejected)
    Status = "Rejected" if random.random() < 0.1 else "Approved"
    
    # Choose a random product code from the loaded list
    product_code = random.choice(product_codes)
    quantity = random.randint(10, 1000)
    pricePerUnit = round(random.uniform(0.1, 50), 2)

    # Ensure we only append complete transactions
    transactions.append((
        generate_transaction_id(), 
        seller, 
        buyer, 
        DT.strftime("%Y-%m-%d %H:%M:%S"), 
        Created_at.strftime("%Y-%m-%d %H:%M:%S"),
        Status,
        product_code, 
        quantity, 
        pricePerUnit
    ))

# Create Transactions DataFrame
Transactions_df = pd.DataFrame(
    transactions, 
    columns=[
        "TransactionID", 
        "Seller", 
        "Buyer",
        "DT", 
        "Created_at",
        "Status",
        "Product", 
        "Quantity", 
        "PricePernit"
    ]
)

# Save Transactions DataFrame
transactions_file_path = os.path.join(data_dir, "generated_data_transactions.xlsx")
Transactions_df.to_excel(transactions_file_path, index=False)
print(f"Transaction data saved to: {transactions_file_path}")

print(f"Transaction data successfully generated with {len(Transactions_df)} valid transactions.") 