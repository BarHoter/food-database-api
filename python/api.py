from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
from typing import List, Dict, Any

app = FastAPI(
    title="Food Database API",
    description="API for accessing food database information",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Get the project root directory
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, "../data")

# Load data
def load_json_data(filename: str) -> List[Dict[str, Any]]:
    try:
        with open(os.path.join(data_dir, filename), 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading {filename}: {str(e)}")

@app.get("/")
async def root():
    """Welcome message and API information"""
    return {
        "message": "Welcome to the Food Database API",
        "endpoints": {
            "products": "/products",
            "transactions": "/transactions",
            "agents": "/agents",
            "documentation": "/docs"
        }
    }

# Products endpoints
@app.get("/products", response_model=List[Dict[str, Any]])
async def get_products():
    """Get all products"""
    return load_json_data("random_records.json")

@app.get("/products/{product_code}")
async def get_product(product_code: str):
    """Get a specific product by code"""
    products = load_json_data("random_records.json")
    for product in products:
        if str(product["Code"]) == product_code:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

# Transactions endpoints
@app.get("/transactions", response_model=List[Dict[str, Any]])
async def get_transactions():
    """Get all transactions"""
    return load_json_data("generated_data_transactions.json")

@app.get("/transactions/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    transactions = load_json_data("generated_data_transactions.json")
    for transaction in transactions:
        if transaction["TransactionID"] == transaction_id:
            return transaction
    raise HTTPException(status_code=404, detail="Transaction not found")

# Agents endpoints
@app.get("/agents", response_model=List[Dict[str, Any]])
async def get_agents():
    """Get all agents"""
    return load_json_data("generated_data_agents.json")

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    agents = load_json_data("generated_data_agents.json")
    for agent in agents:
        if agent["AgentID"] == agent_id:
            return agent
    raise HTTPException(status_code=404, detail="Agent not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 