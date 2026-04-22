from groq import Groq
import base64
import json
import os

client = Groq(api_key=os.environ.get('GROQ_API_KEY'))


def extract_receipt_data(image_path):
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
Read this receipt image and return ONLY JSON:
{
  "title": "",
  "amount": 0,
  "category": "",
  "description": ""
}
"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    }
                ]
            }
        ],
        temperature=0
    )

    raw = response.choices[0].message.content

    start = raw.find("{")
    end = raw.rfind("}") + 1

    return json.loads(raw[start:end])