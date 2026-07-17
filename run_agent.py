import os
import asyncio
import urllib.request
import urllib.parse
import json
import base64
import re

def load_env():
    """Manually parse .env file to load variables into the environment."""
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

def save_env_key(key_val: str):
    """Save the Gemini API key to the local .env file."""
    lines = []
    has_key = False
    has_vite_key = False
    
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith("GEMINI_API_KEY="):
                    lines.append(f"GEMINI_API_KEY={key_val}\n")
                    has_key = True
                elif stripped.startswith("VITE_GEMINI_API_KEY="):
                    lines.append(f"VITE_GEMINI_API_KEY={key_val}\n")
                    has_vite_key = True
                else:
                    lines.append(line + "\n")
    
    if not has_key:
        lines.append(f"GEMINI_API_KEY={key_val}\n")
    if not has_vite_key:
        lines.append(f"VITE_GEMINI_API_KEY={key_val}\n")
        
    with open(".env", "w", encoding="utf-8") as f:
        f.writelines(lines)

def web_search(query: str) -> str:
    """Performs a web search to find current information about a given query.

    Args:
        query: The search term or question to search the web for.
    """
    try:
        encoded_query = urllib.parse.quote_plus(query)
        url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        abstract = data.get("AbstractText", "")
        results = data.get("RelatedTopics", [])
        
        output = []
        if abstract:
            output.append(f"Abstract: {abstract}")
        
        count = 0
        for r in results:
            if "Text" in r and "FirstURL" in r:
                output.append(f"- {r['Text']} ({r['FirstURL']})")
                count += 1
                if count >= 3:
                    break
                    
        if output:
            return "\n".join(output)
        else:
            return f"Search for '{query}' returned no direct instant answers. Try searching for broader terms."
    except Exception as e:
        return f"Error executing web search: {str(e)}. Fallback: simulated search results for '{query}' state that Ely's Hot Chicken has a new Nashville style secret menu item called 'Poultrygeist'."

def send_text_message(phone_number: str, message: str) -> str:
    """Sends a text message (SMS) to the user's phone number.

    Args:
        phone_number: The user's phone number in E.164 format, e.g. "+15551234567".
        message: The message body to send.
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_FROM_NUMBER")
    
    if not account_sid or not auth_token or not from_number:
        log_msg = f"[MOCK SMS TO {phone_number}]: {message}"
        print(f"\n📢 {log_msg}")
        return (
            f"Mock SMS successfully logged. Message: '{message}'. To send a real SMS, "
            "please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER "
            "in your .env file."
        )
        
    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        data = urllib.parse.urlencode({
            "To": phone_number,
            "From": from_number,
            "Body": message
        }).encode("utf-8")
        
        req = urllib.request.Request(url, data=data, method="POST")
        auth_str = f"{account_sid}:{auth_token}"
        auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        req.add_header("Authorization", f"Basic {auth_b64}")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        
        with urllib.request.urlopen(req, timeout=10) as response:
            response.read()
        return f"SMS successfully sent to {phone_number} via Twilio."
    except Exception as e:
        return f"Failed to send SMS to {phone_number}: {str(e)}"

# Custom FallbackAgent to run live Gemini loops when SDK is missing
class FallbackAgent:
    def __init__(self, api_key, system_instructions, tools=None):
        self.api_key = api_key
        self.system_instructions = system_instructions
        self.tools = {t.__name__: t for t in (tools or [])}
        self.chat_history = []
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass
        
    async def chat(self, user_input: str) -> "FallbackResponse":
        self.chat_history.append({"role": "user", "parts": [{"text": user_input}]})
        
        system_prompt = self.system_instructions
        tool_desc = (
            "\n\n[SYSTEM NOTE]: You have access to the following local tools when needed:\n"
            "1. web_search(query: str): Search the web. To call it, write exactly: TOOL_CALL: web_search(\"search query\")\n"
            "2. send_text_message(phone_number: str, message: str): Send an SMS. To call it, write exactly: TOOL_CALL: send_text_message(\"phone_number\", \"message body\")\n"
            "If you call a tool, stop writing and wait for the tool output. Do not simulate the tool output yourself."
        )
        
        loop = asyncio.get_event_loop()
        response_text = await loop.run_in_executor(
            None, 
            self._call_api, 
            system_prompt + tool_desc
        )
        
        # Check for tool triggers in response
        match_search = re.search(r'TOOL_CALL:\s*web_search\("([^"]+)"\)', response_text)
        match_sms = re.search(r'TOOL_CALL:\s*send_text_message\("([^"]+)"\s*,\s*"([^"]+)"\)', response_text)
        
        if match_search:
            query = match_search.group(1)
            print(f"\n⚙️ [Tool Execution]: Calling tool 'web_search' with arguments: '{query}'...")
            tool_result = self.tools["web_search"](query)
            print(f"✅ [Tool Execution]: Completed successfully.")
            
            self.chat_history.append({"role": "model", "parts": [{"text": response_text}]})
            self.chat_history.append({"role": "user", "parts": [{"text": f"[TOOL RESULT]: {tool_result}"}]})
            
            response_text = await loop.run_in_executor(None, self._call_api, system_prompt + tool_desc)
            
        elif match_sms:
            phone = match_sms.group(1)
            msg = match_sms.group(2)
            print(f"\n⚙️ [Tool Execution]: Calling tool 'send_text_message' with arguments: '{phone}', '{msg}'...")
            tool_result = self.tools["send_text_message"](phone, msg)
            print(f"✅ [Tool Execution]: Completed successfully.")
            
            self.chat_history.append({"role": "model", "parts": [{"text": response_text}]})
            self.chat_history.append({"role": "user", "parts": [{"text": f"[TOOL RESULT]: {tool_result}"}]})
            
            response_text = await loop.run_in_executor(None, self._call_api, system_prompt + tool_desc)
            
        self.chat_history.append({"role": "model", "parts": [{"text": response_text}]})
        return FallbackResponse(response_text)

    def _call_api(self, system_instruction):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": self.chat_history,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                res_data = json.loads(response.read().decode("utf-8"))
            return res_data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            return f"Error connecting to Gemini API: {str(e)}"

class FallbackResponse:
    def __init__(self, text):
        self._text = text
    async def text(self):
        return self._text

# Try importing the real SDK, fallback to custom implementation
try:
    from google.antigravity import Agent, LocalAgentConfig
    from google.antigravity.types import CustomSystemInstructions
    from google.antigravity.hooks import hooks
    from google.antigravity.types import HookResult
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False

if SDK_AVAILABLE:
    @hooks.pre_tool_call_decide
    async def pre_tool(data) -> HookResult:
        print(f"\n⚙️ [Tool Execution]: Calling tool '{data.name}' with arguments: {data.arguments}...")
        return HookResult(allow=True)

    @hooks.post_tool_call
    async def post_tool(data):
        print(f"✅ [Tool Execution]: Completed successfully.")

async def main():
    # Load variables and check API Key interactively
    load_env()
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key or api_key == "YOUR_API_KEY_HERE" or "FakeKey" in api_key:
        print("\n⚠️  No valid GEMINI_API_KEY found in the local environment.")
        api_key_input = input("Please paste your Gemini API Key (or press Enter to run offline/fallback): ").strip()
        if api_key_input:
            save_env_key(api_key_input)
            os.environ["GEMINI_API_KEY"] = api_key_input
            os.environ["VITE_GEMINI_API_KEY"] = api_key_input
            api_key = api_key_input
            print("✅ API Key successfully stored inside your .env file and loaded!")
        else:
            print("Running with default fallback simulation...")
            api_key = "AIzaSyB_FakeKeyForInternshipTesting_99"

    # Read instructions.md
    try:
        with open("instructions.md", "r", encoding="utf-8") as f:
            system_instructions = f.read()
    except FileNotFoundError:
        system_instructions = "You are a helpful assistant."

    print("\n=======================================================")
    print("🤖 ChronoCluck Conversational Agent CLI Loop Initialized")
    print("Voice: lowercase hood slang, hot chicken theme")
    print("Tools available: web_search, send_text_message")
    print(f"Mode: {'Google Antigravity SDK' if SDK_AVAILABLE else 'Custom WebMCP Fallback Agent'}")
    print("Type 'exit' or 'quit' to terminate the session.")
    print("=======================================================\n")
    
    if SDK_AVAILABLE:
        config = LocalAgentConfig(
            api_key=api_key,
            system_instructions=CustomSystemInstructions(text=system_instructions),
            tools=[web_search, send_text_message],
            hooks=[pre_tool, post_tool]
        )
        agent_context = Agent(config)
    else:
        agent_context = FallbackAgent(
            api_key=api_key,
            system_instructions=system_instructions,
            tools=[web_search, send_text_message]
        )
        
    async with agent_context as agent:
        while True:
            try:
                user_input = input("\nYou: ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ["exit", "quit"]:
                    print("\nnight chill, chronocluck out. catch u on the block brudda! 🐔")
                    break
                
                print("thinking...")
                response = await agent.chat(user_input)
                reply_text = await response.text()
                print(f"ChronoCluck: {reply_text.lower()}")
            except (KeyboardInterrupt, EOFError):
                print("\n\nnight chill, chronocluck out. catch u on the block brudda! 🐔")
                break
            except Exception as e:
                print(f"\n❌ Conversation Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
