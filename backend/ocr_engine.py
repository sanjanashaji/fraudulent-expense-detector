import easyocr

reader = easyocr.Reader(['en'])

def extract_receipt_data(image_path):
    result = reader.readtext(image_path, detail=0)

    text = " ".join(result)

    amount = 0

    for word in result:
        if word.isdigit():
            amount = int(word)
            break

    category = "Food" if "hotel" in text.lower() else "Other"

    return {
        "raw_text": text,
        "amount": amount,
        "category": category,
        "title": "Receipt Expense",
        "description": text[:200]
    }