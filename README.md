# 🛒 Plantry

### An Explainable, ML-Driven Smart Grocery Planning System

Plantry is a *smart grocery planning application* that helps households create better shopping lists by learning from past behavior.
Unlike rule-based reminder apps, Plantry uses *multiple interpretable ML signals* to generate *transparent, explainable suggestions* that feel human—not spammy.

The system is intentionally designed to *avoid hallucinated recommendations* and surfaces suggestions *only when supported by data*.

---

## Overview

Plantry analyzes *household shopping behavior* to assist list creation and provide meaningful insights.

Key design choices:

* No online model training
* No black-box inference
* No opaque recommendations

The backend consumes *precomputed model outputs* stored in Firestore and maps them into *UI-friendly, explainable suggestions*.

---

## Core Features

### Smart Suggestions

Suggestions are generated *during list creation* and grouped into three categories:

#### 1. Frequently Bought Together

* Derived from *association rules (FP-Growth)*
* Uses both *forward and reverse lookups*

#### 2. You Usually Forget

* Based on *forgetfulness probabilities*
* Weighted by *evidence counts*

#### 3. Seasonal / Due Reminders

* Based on *temporal restocking patterns*
* Triggered using *confidence thresholds*

Each suggestion includes:

* Category (frequent / forgotten / seasonal)
* Confidence level
* Human-readable explanation

---

### Household Insights

A *read-only analytics view* providing:

* Shopping rhythm (average restock gap & cadence)
* Frequently forgotten items
* High-confidence item associations

All insights are:

* Computed *server-side*
* Derived strictly from *stored model outputs*

---

## Data Model (Firestore)

### shopping_events

Raw shopping history.

json
{
  "householdId": "string",
  "shoppingDate": "timestamp",
  "items": ["milk", "rice", "oil"],
  "shoppingSource": "local_market | supermarket | online_grocery_app",
  "createdAt": "timestamp"
}


---

### forgotten_events

Used to train forgetfulness models.

json
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


---

### model_outputs_associations

Association rules (FP-Growth output).

json
{
  "rules": {
    "milk": [
      { "item": "batter", "confidence": 0.78, "support": 0.42 }
    ]
  }
}


---

### model_outputs_forgetfulness

Forgetfulness probabilities.

json
{
  "scores": {
    "oil": { "forgetProbability": 0.48, "evidenceCount": 10 }
  }
}


---

### model_outputs_temporal

Temporal restocking patterns.

json
{
  "items": {
    "atta": {
      "pattern": "monthly",
      "avgGapDays": 31,
      "confidence": 0.6
    }
  }
}


---

## Backend API

### POST /api/suggestions/infer

Generates suggestions for a shopping list.

*Request*

json
{
  "householdId": "household_001",
  "currentList": ["milk", "eggs"]
}


*Response*

json
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


> Suggestion distribution is *quota-based* to prevent dominance by a single signal.

---

### GET /api/insights/household

Returns household-level insights.

*Query*


?householdId=household_001


---

## Architecture


Frontend (React)
        |
        v
REST API (Node.js / Express)
        |
        v
Firestore (Events + Precomputed Model Outputs)


### Key Characteristics

* No ML logic in the frontend
* No raw event scanning during inference
* All suggestions derived from precomputed outputs
* Deterministic and explainable inference

---

## Design Notes

* Deterministic inference pipeline
* No heuristic suggestions without supporting data
* Explicit separation between:

  * Training data
  * Model outputs
  * Inference logic
* Designed to handle *sparse household data*
* Avoids forced or noisy recommendations

---

## Setup (Backend)

bash
npm install
node index.js


> Requires a valid *Firebase Admin service account*.

---

## Current Status

The system currently supports:

* Association-based suggestions
* Forgetfulness-based reminders
* Temporal restock reminders
* Household-level analytics and insights

Further extensions can be added *without modifying the frontend contract*.
