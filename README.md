# Food Database API

A FastAPI-based REST API for accessing food database information.

## Features

- Products management
- Transactions tracking
- Agents (users) management
- RESTful API endpoints
- Swagger documentation

## API Endpoints

- `/products` - Get all products
- `/products/{product_code}` - Get specific product
- `/transactions` - Get all transactions
- `/transactions/{transaction_id}` - Get specific transaction
- `/agents` - Get all agents
- `/agents/{agent_id}` - Get specific agent
- `/docs` - API documentation (Swagger UI)

## Setup

1. Install dependencies:
```bash
pip install -r python/requirements.txt
```

2. Run the API:
```bash
python python/api.py
```

The API will be available at `http://localhost:8000`

## Documentation

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 