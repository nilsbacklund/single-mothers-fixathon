# %%
import os, json, time
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GREENPT_API_KEY = os.environ["GREENPT_API_KEY"]
client = OpenAI(
    api_key=GREENPT_API_KEY,
    base_url="https://api.greenpt.ai/v1/",
)

# ---- Your tools (real code) ----
def get_time(args: dict) -> dict:
    # Example tool: return unix time + a timezone label
    tz = args.get("tz", "UTC")
    return {"tz": tz, "unix": int(time.time())}

TOOL_REGISTRY = {
    "get_time": get_time,
}

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_time",
            "description": "Get the current unix time. Optionally set tz label (e.g. 'Europe/Amsterdam').",
            "parameters": {
                "type": "object",
                "properties": {"tz": {"type": "string"}},
                "required": [],
                "additionalProperties": False,
            },
        },
    }
]

messages = [
    # {"role": "system", "content": "You are a helpful chatbot."},
    {"role": "user", "content": "What time is it in Amsterdam?"},
]

# 1) Ask model (allow tool calling)
resp = client.chat.completions.create(
    model="green-l",          # or "green-r" (check /v1/models)
    messages=messages,
    tools=tools,
    tool_choice="auto",
)

print(resp.choices[0].message)
msg = resp.choices[0].message
messages.append(msg)

# 2) If tool calls happened, execute + send tool results back
if getattr(msg, "tool_calls", None):
    for call in msg.tool_calls:
        fn_name = call.function.name
        fn_args = json.loads(call.function.arguments or "{}")

        # IMPORTANT: only allow tools you explicitly register
        if fn_name not in TOOL_REGISTRY:
            tool_result = {"error": f"Tool not allowed: {fn_name}"}
        else:
            tool_result = TOOL_REGISTRY[fn_name](fn_args)

        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(tool_result),
        })

    # 3) Ask model again so it can use tool output
    resp2 = client.chat.completions.create(
        model="green-r-raw",
        messages=messages,
    )
    print(resp2.choices[0].message.content)
else:
    print(msg.content)

def print_messages(messages):
    for i, m in enumerate(messages, 1):
        role = m.get("role", "?")
        print(f"\n--- {i}. {role.upper()} ---")

        # regular content
        if m.get("content"):
            print(m["content"])

        # assistant tool calls (if any)
        if role == "assistant" and m.get("tool_calls"):
            for tc in m["tool_calls"]:
                fn = tc["function"]["name"]
                args = tc["function"].get("arguments", "")
                print(f"[tool_call] {fn} args={args}")

        # tool result messages
        if role == "tool":
            tcid = m.get("tool_call_id")
            if tcid:
                print(f"[tool_result for {tcid}]")
            # often JSON-string content
            try:
                parsed = json.loads(m.get("content", ""))
                print(json.dumps(parsed, indent=2, ensure_ascii=False))
            except Exception:
                print(m.get("content", ""))

# %%
print(messages)
# %%
