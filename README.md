Plantry 🛒

An Explainable, ML-Driven Smart Grocery Planning System

Plantry is a smart grocery planning application that helps households create better shopping lists by learning from past behavior.
Unlike rule-based reminder apps, Plantry uses multiple interpretable ML signals to generate transparent, explainable suggestions that feel human, not spammy.

The system is intentionally designed to avoid hallucinated recommendations and instead surfaces suggestions only when supported by data.

Overview

The system analyzes past shopping behavior to assist list creation and provide household-level insights.
It does not perform online model training or black-box inference.

The backend consumes precomputed model outputs stored in Firestore and maps them to UI-friendly suggestions.

Features
Smart Suggestions

Suggestions are generated during list creation and grouped into three categories:

Frequently Bought Together
Derived from association rules (FP-Growth), using both forward and reverse lookups.

You Usually Forget
Based on forgetfulness probabilities and evidence counts.

Seasonal / Due Reminders
Based on temporal restocking patterns and confidence scores.

Each suggestion includes:

Category (frequent, forgotten, seasonal)

Confidence level

Explanation string

Household Insights

A read-only analytics view providing:

Shopping rhythm (average restock gap and dominant cadence)

Frequently forgotten items

High-confidence item pairs

All insights are computed server-side from stored model outputs.

Data Model (Firestore)
shopping_events

Raw shopping history.

{
  "householdId": "string",
  "shoppingDate": "timestamp",
  "items": ["milk", "rice", "oil"],
  "shoppingSource": "local_market | supermarket | online_grocery_app",
  "createdAt": "timestamp"
}

forgotten_events

Events used to train forgetfulness models.

{
  "householdId": "string",
  "shoppingEventId": "string",
  "item": "string",
  "eventDate": "timestamp",
  "boughtLater": true,
  "laterPurchaseMode": "offline | online",
  "reason": "forgot_to_add | ran_out_unexpectedly",
  "createdAt": "timestamp"
}

model_outputs_associations

Association rules (FP-Growth output).

{
  "rules": {
    "milk": [
      { "item": "batter", "confidence": 0.78, "support": 0.42 }
    ]
  }
}

model_outputs_forgetfulness

Forgetfulness probabilities.

{
  "scores": {
    "oil": {
      "forgetProbability": 0.48,
      "evidenceCount": 10
    }
  }
}

model_outputs_temporal

Temporal restocking patterns.

{
  "items": {
    "atta": {
      "pattern": "monthly",
      "avgGapDays": 31,
      "confidence": 0.6
    }
  }
}

Backend API
POST /api/suggestions/infer

Generates suggestions for a shopping list.

Request

{
  "householdId": "household_001",
  "currentList": ["milk", "eggs"]
}


Response

{
  "suggestions": [
    {
      "id": "batter",
      "name": "Batter",
      "type": "frequent",
      "confidence": "high",
      "reason": "Often bought together with milk."
    }
  ]
}


Suggestion distribution is quota-based to avoid dominance by a single signal.

GET /api/insights/household

Returns household-level insights.

Query

?householdId=household_001

Architecture
Frontend (React)
    |
    | REST
    v
Backend (Node.js / Express)
    |
    | Read-only inference
    v
Firestore (model outputs + events)


Key characteristics:

No ML logic in frontend

No raw event scanning during inference

All suggestions derived from precomputed outputs

Design Notes

Deterministic inference

No heuristic suggestions without supporting data

Explicit separation between training data and inference logic

Designed to handle sparse data without forced recommendations

Setup (Backend)
npm install
node index.js


Requires a valid Firebase Admin service account.

Status

The system currently supports:

Association-based suggestions

Forgetfulness-based reminders

Temporal restock reminders

Household-level insights

Further extensions can be added without modifying the frontend contract.