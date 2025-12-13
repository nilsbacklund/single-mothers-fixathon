import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ["GREENPT_API_KEY"],
    base_url="https://api.greenpt.ai/v1",
)

def chat(messages, model="green-r", temperature=0.2):
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    return resp.choices[0].message.content
