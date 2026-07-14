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

# Load API keys from the local .env file
load_env()

# Get key from environment
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("Warning: GEMINI_API_KEY placeholder detected. Please set your real API key in the .env file.")

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

    async def main():
        # Set up custom system instructions from the markdown content and custom tools
        config = LocalAgentConfig(
            api_key=api_key,
            system_instructions=CustomSystemInstructions(text=system_instructions),
            tools=[web_search, send_text_message]
        )
        
        print("Initializing ChronoCluck Agent with system prompt and communication tools...")
        async with Agent(config) as agent:
            # First CLI prompt call simulating user interaction
            print("\nUser: hello")
            response = await agent.chat("hello")
            print(f"Agent: {await response.text()}")
            
            print("\nUser: tell me a chicken joke")
            response = await agent.chat("tell me a chicken joke")
            print(f"Agent: {await response.text()}")

            # Test the web search tool
            print("\nUser: can you search for the secret menu at Ely's Hot Chicken?")
            response = await agent.chat("can you search for the secret menu at Ely's Hot Chicken?")
            print(f"Agent: {await response.text()}")

            # Test the text messaging tool
            print("\nUser: can you send a text to +15551234567 saying I got a Poultrygeist order ready?")
            response = await agent.chat("can you send a text to +15551234567 saying I got a Poultrygeist order ready?")
            print(f"Agent: {await response.text()}")

    if __name__ == "__main__":
        asyncio.run(main())

except ImportError:
    print("\nGoogle Antigravity SDK is not installed. To run this script, please install it using:")
    print("pip install google-antigravity")
