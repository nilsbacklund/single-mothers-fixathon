# %%
import os, json, time
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GREENPT_API_KEY = os.environ["GREENPT_API_KEY"]
# OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
client = OpenAI(
    api_key=GREENPT_API_KEY,
    base_url="https://api.greenpt.ai/v1/",
)

# ---- Your tools (real code) ----
def get_time(args: dict) -> dict:
    # Example tool: return unix time + a timezone label
    tz = args.get("tz", "UTC")
    return {"tz": tz, "unix": int(time.time())}

def save_user_info_to_json(user_object: dict, filename: str = "../data/user_info.json"):
    # Load existing data if file exists
    existing_info = {}
    if os.path.exists(filename):
        try:
            with open(filename, "r") as f:
                existing_info = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            existing_info = {}
    
    # Build new info from all provided arguments
    new_info = user_object
    
    for key, value in new_info.items():
        # Skip empty/default values
        if value is None or value == "" or value == 0 or value == []:
            continue
        
        # Handle list fields by merging and removing duplicates
        if isinstance(value, list):
            existing_list = existing_info.get(key, [])
            existing_info[key] = list(set(existing_list + value))
        else:
            existing_info[key] = value
    
    with open(filename, "w") as f:
        json.dump(existing_info, f, indent=2)

    return {"status": "success", "saved_info": existing_info}


def read_user_info_from_json(filename: str = "../data/user_info.json") -> dict:
    try:
        with open(filename, "r") as f:
            user_info = json.load(f)
        return {"status": "success", "user_info": user_info}
    except FileNotFoundError:
        return {"status": "error", "message": "File not found"}

def save_user_info(user_obj: dict = None) -> dict:
    # Example tool: save user info to a file (mock implementation)
    user_info = {}
    if user_obj.get("name") is not None:
        user_info["name"] = user_obj["name"]
    if user_obj.get("age") is not None:
        user_info["age"] = user_obj["age"]
    if user_obj.get("email") is not None:
        user_info["email"] = user_obj["email"]
    if user_obj.get("hobbies") is not None:
        user_info["hobbies"] = user_obj["hobbies"]
    print(user_info)
    
    save_user_info_to_json(user_info)
    return {"status": "success", "saved_info": user_info}


def get_user_info(_) -> dict:
    # Example tool: return unix time + a timezone label
    user_info = read_user_info_from_json()
   
    return user_info

TOOL_REGISTRY = {
    "get_time": get_time,
    "save_user_info": save_user_info,
    "get_user_info": get_user_info,
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
    },
  {
    "type": "function",
    "function": {
      "name": "save_user_info",
      "description": "Save user info (name, age, email, hobbies) to a local file.",
      "parameters": {
        "type": "object",
        "properties": {
          "name":   {"type": "string"},
          "age":    {"type": "integer", "minimum": 0},
          "email":  {"type": "string", "description": "Email address"},
          "hobbies": {
            "type": "array",
            "items": {"type": "string"}
          }
        },
        "required": [],
        "additionalProperties": False
      }
    }
  },
    {
    "type": "function",
    "function": {
      "name": "get_user_info",
      "description": "Retrieve stored user information from a local file.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False
      }
    }
  },
]

def create_message(message: str) -> dict:
    return {"role": "user", "content": message}


# 1) Ask model (force tool calling)
def send_message(messages):
    resp = client.chat.completions.create(
        model="green-l",          # testing with green-r
        messages=messages,
        tools=tools,
        tool_choice="required",   # force the model to call a tool
    )

    msg = resp.choices[0].message
    messages.append(msg)

    if getattr(msg, "tool_calls", None):
        for call in msg.tool_calls:
            fn_name = call.function.name
            fn_args = json.loads(call.function.arguments or "{}")

            # IMPORTANT: only allow tools you explicitly register
            print(f"Calling tool: {fn_name} with args: {fn_args}")
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
            model="green-r",
            messages=messages,
        )
        print(resp2.choices[0].message.content)
        messages.append(resp2.choices[0].message)
    else:
        messages.append(msg)

    return messages

messages = []

initial_message_content = "You are supposed to collect information about the user and using the toolcall to collect it. There are a number of fields fill each one in whenever they are telling you details about themself Also reply in English. Here starts the user message: "
initial_message = create_message(initial_message_content)
messages.append(initial_message)

messages = send_message(messages)


msg_content = "Hi, Im Nils and like Triathlon! My age is 25"
messages.append(create_message(msg_content))

messages = send_message(messages)


# %%
for m in messages:
    print(m)
# %%
print(get_user_info())
# %%
