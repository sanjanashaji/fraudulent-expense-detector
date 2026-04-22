from groq import Groq
import json
import chromadb
import re
import os

groq_client = Groq(api_key="UR_API_KEY")

CATEGORY_LIMITS = {
    "Travel": 15000,
    "Food": 1500,
    "Equipment": 10000,
    "Entertainment": 5000,
    "Training": 6000,
    "Other": 3000
}

# ChromaDB setup
client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection("expenses")


def extract_people_count(text):
    numbers = re.findall(r"\d+", text)
    if numbers:
        return int(numbers[0])
    return 1


def is_meaningful_text(text):
    words = re.findall(r"[A-Za-z]+", text)
    return len(words) >= 2


def get_fraud_score(expense: dict) -> dict:
    flags = []
    score = 0

    amount = expense["amount"]
    category = expense["category"]
    title = expense["title"]
    description = expense["description"]
    submitted_by = expense.get("submitted_by", "")

    cat_limit = CATEGORY_LIMITS.get(category, 500)

    full_text = f"{title} {description}".lower()

    people_count = extract_people_count(full_text)
    effective_limit = cat_limit * people_count

    # Rule 0: invalid text detection
    if not is_meaningful_text(title) or not is_meaningful_text(description):
        flags.append("Title or description lacks meaningful words")
        score += 35

    # Rule 1: extreme amount checks
    if amount > 500000:
        flags.append("Extremely abnormal amount detected")
        score += 70

    elif amount > 50000:
        flags.append("Very high suspicious amount")
        score += 55

    elif amount > effective_limit * 10:
        flags.append("Amount massively exceeds adjusted category limit")
        score += 60

    elif amount > effective_limit * 3:
        flags.append("Amount strongly exceeds adjusted category limit")
        score += 45

    elif amount > effective_limit:
        flags.append(
            f"Amount Rs.{amount} exceeds adjusted {category} limit of Rs.{effective_limit}"
        )
        score += 30

    # Rule 2: suspicious round number
    if amount % 100 == 0 and amount >= 100 and people_count == 1:
        flags.append("Round number amount detected — common in fictitious claims")
        score += 15

    # Rule 3: food per person logic
    if category == "Food" and people_count > 1:
        per_person = amount / people_count

        if per_person < 20:
            flags.append("Food expense unusually low per person")
            score += 25

        elif per_person > 500:
            flags.append("Food expense unusually high per person")
            score += 25

    # Rule 4: travel logic
    if category == "Travel":
        if amount < 100 and people_count == 1:
            flags.append("Travel expense unusually low")
            score += 15

    # Rule 5: suspicious keywords
    suspicious_words = [
        "urgent",
        "cash",
        "manual",
        "personal",
        "adjustment",
        "miscellaneous"
    ]

    for word in suspicious_words:
        if word in full_text:
            flags.append(f"Suspicious keyword detected: {word}")
            score += 10

    # Rule 6: duplicate / similarity check
    query_text = f"{title} {amount} {category} {description}"

    results = collection.query(
        query_texts=[query_text],
        n_results=3
    )

    similar_cases = results["documents"][0]

    if len(similar_cases) > 1:
        flags.append("Similar previous expense found")
        score += 15

    # Exact duplicate check
    for case in similar_cases:
        if title.lower() in case.lower() and str(amount) in case:
            flags.append("Possible duplicate expense claim detected")
            score += 30
            break

    # Tone selection
    temp_score = max(0, min(100, score))

    if temp_score < 25:
        tone = "This claim appears mostly legitimate with only minor concerns."
    elif temp_score < 50:
        tone = "This claim has moderate risk indicators and may need review."
    else:
        tone = "This claim appears suspicious and should be carefully verified."

    # AI explanation
    try:
        prompt = f"""
You are a senior corporate expense fraud analyst.

Analyze this expense claim carefully.

Expense details:
{json.dumps(expense)}

Similar previous expense cases:
{similar_cases}

Detected rule violations:
{flags}

Company policy:
- Food limit: Rs.1500
- Travel limit: Rs.15000
- Equipment limit: Rs.10000
- Entertainment limit: Rs.5000
- Training limit: Rs.6000

Instructions:
1. Explain exact fraud reason clearly.
2. Mention if amount exceeds policy.
3. Mention duplicate suspicion if similar claim exists.
4. Mention if description appears valid.
5. Use Indian Rupees only.

Return ONLY JSON:
{{
  "additional_flags": ["extra suspicious findings if any"],
  "risk_score_adjustment": 0,
  "explanation": "Clear professional explanation with actual reason"
}}
"""

        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        raw = resp.choices[0].message.content
        start = raw.find("{")
        end = raw.rfind("}") + 1

        ai_result = json.loads(raw[start:end])

        score += ai_result.get("risk_score_adjustment", 0)
        flags.extend(ai_result.get("additional_flags", []))
        explanation = ai_result.get("explanation", tone)

    except Exception as e:
        explanation = f"{tone} Rule-based analysis complete."
        print(f"Groq error: {e}")

    # Final clamp
    score = max(0, min(100, score))

    # Risk mapping
    if score >= 80:
        risk = "critical"
    elif score >= 60:
        risk = "high"
    elif score >= 30:
        risk = "medium"
    else:
        risk = "low"

    return {
        "fraud_score": score,
        "risk_level": risk,
        "flags": flags,
        "explanation": explanation
    }
