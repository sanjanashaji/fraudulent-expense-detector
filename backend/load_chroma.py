import chromadb
import csv

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection("expenses")

with open("sample_expenses.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for i, row in enumerate(reader):
        text = f"{row['title']} {row['amount']} {row['category']} {row['description']}"

        collection.add(
            documents=[text],
            ids=[str(i)]
        )

print("Data loaded into ChromaDB")