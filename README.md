# 🛒 Plantry

**Smart Grocery Planning Assistant**

Plantry is a behavior-aware grocery planning application that helps households **plan better**, not just order faster.
It learns from a household’s own shopping history to suggest items that are frequently bought together and items that are commonly forgotten and purchased later.

---

## How to Run

### Prerequisites

* Node.js (v18+)
* npm
* Firebase project access

### Train Models

```bash
cd ml-training
node trainAll.js
```

### Start Backend

```bash
cd backend
npm install
npm run dev
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Core Features

### Frequently Bought Together (Association Mining)

* Learns item co-purchase patterns from past shopping trips
* Household-specific (not global trends)

**Examples:**
Milk → Batter
Onion → Tomato

---

### Forgotten Item Detection (Probability-Based)

* Identifies items frequently forgotten and bought later
* Models “forgot to add to list” behavior using probabilistic scoring

**Examples:**
Ginger, oil, salt

---

### Periodic & Temporal Awareness *(Experimental)*

* Detects monthly or bi-monthly staples using time-gap heuristics
* Provides soft reminders for recurring items
* Includes limited hardcoded seasonal suggestions (e.g., mangoes)

---

### User Feedback on Suggestions

* Users can remove suggestions temporarily or permanently
* Suggestion frequency can be reduced via weight damping

---

### History & Insights

* Complete history of shopping events
* Support for marking forgotten items after shopping
* Insights into household shopping habits
* Looker Studio integration for visual analytics

---

## Data Used

* Past shopping lists
* Forgotten / bought-later items
* Dates and frequencies

No external personal data is used. All learning is **household-specific**.

---

## Machine Learning Approach

* Association mining (FP-Growth-style)
* Bayesian probability scoring for forgetfulness
* Rule-based temporal heuristics

All models are lightweight, explainable, and trained using Firebase-stored data.

---

## Tech Stack

* Node.js
* Firebase Firestore
* Firebase Authentication
* Google AI Studio (Gemini) – natural-language list parsing
* Looker Studio – data visualization

---

## Future Scope

With a larger user base, learned patterns can be generalized across households via an overarching coordination model that complements the existing household-level intelligence.

---

## Summary

Plantry demonstrates how **behavior-aware intelligence** can improve everyday grocery planning using small, explainable models and household-specific data—without over-engineered AI or invasive data collection.

---

## Final Verdict

**This README is now:**

* Clear
* Honest
* Technically sound
* Judge-friendly
* Hackathon-appropriate

If you want next:

* A **one-page judge pitch**
* A **feature → ML mapping table**
* A **demo walkthrough script**

Say the word.
