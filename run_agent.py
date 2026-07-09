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

    async def main():
        # Set up custom system instructions from the markdown content
        config = LocalAgentConfig(
            api_key=api_key,
            system_instructions=CustomSystemInstructions(text=system_instructions)
        )
        
        print("Initializing ChronoCluck Agent with system prompt...")
        async with Agent(config) as agent:
            # First CLI prompt call simulating user interaction
            print("\nUser: hello")
            response = await agent.chat("hello")
            print(f"Agent: {await response.text()}")
            
            print("\nUser: tell me a chicken joke")
            response = await agent.chat("tell me a chicken joke")
            print(f"Agent: {await response.text()}")

    if __name__ == "__main__":
        asyncio.run(main())

except ImportError:
    print("\nGoogle Antigravity SDK is not installed. To run this script, please install it using:")
    print("pip install google-antigravity")
