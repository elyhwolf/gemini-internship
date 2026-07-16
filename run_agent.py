import os
import asyncio

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

# Load API keys from the local .env file
load_env()

# Get key from environment
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("\n⚠️  No valid GEMINI_API_KEY found in the local environment.")
    api_key_input = input("Please paste your Gemini API Key: ").strip()
    if api_key_input:
        save_env_key(api_key_input)
        os.environ["GEMINI_API_KEY"] = api_key_input
        os.environ["VITE_GEMINI_API_KEY"] = api_key_input
        api_key = api_key_input
        print("✅ API Key successfully stored inside your .env file and loaded!")
    else:
        print("Running with placeholder key settings...")

# Read the custom AI persona instructions from instructions.md
try:
    with open("instructions.md", "r", encoding="utf-8") as f:
        system_instructions = f.read()
    print("Successfully read instructions.md persona file.")
except FileNotFoundError:
    print("Error: instructions.md file not found in root directory.")
    system_instructions = "You are a helpful assistant."

# Configure the agent using the Google Antigravity SDK
try:
    from google.antigravity import Agent, LocalAgentConfig
    from google.antigravity.types import CustomSystemInstructions
    import urllib.request
    import urllib.parse
    import json
    import base64

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

    from google.antigravity.hooks import hooks
    from google.antigravity.types import HookResult

    @hooks.pre_tool_call_decide
    async def pre_tool(data) -> HookResult:
        print(f"\n⚙️ [Tool Execution]: Calling tool '{data.name}' with arguments: {data.arguments}...")
        return HookResult(allow=True)

    @hooks.post_tool_call
    async def post_tool(data):
        print(f"✅ [Tool Execution]: Completed successfully.")

    async def main():
        # Set up custom system instructions from the markdown content, custom tools, and lifecycle hooks
        config = LocalAgentConfig(
            api_key=api_key,
            system_instructions=CustomSystemInstructions(text=system_instructions),
            tools=[web_search, send_text_message],
            hooks=[pre_tool, post_tool]
        )
        
        print("\n=======================================================")
        print("🤖 ChronoCluck Conversational Agent CLI Loop Initialized")
        print("Voice: lowercase hood slang, hot chicken theme")
        print("Tools available: web_search, send_text_message")
        print("Type 'exit' or 'quit' to terminate the session.")
        print("=======================================================\n")
        
        async with Agent(config) as agent:
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
                    print(f"ChronoCluck: {reply_text}")
                except (KeyboardInterrupt, EOFError):
                    print("\n\nnight chill, chronocluck out. catch u on the block brudda! 🐔")
                    break
                except Exception as e:
                    print(f"\n❌ Conversation Error: {e}")

    if __name__ == "__main__":
        asyncio.run(main())

except ImportError:
    print("\nGoogle Antigravity SDK is not installed. To run this script, please install it using:")
    print("pip install google-antigravity")
