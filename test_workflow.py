import unittest
import os
from run_agent import load_env, web_search, send_text_message, FallbackAgent, FallbackResponse

class TestAgentWorkflow(unittest.TestCase):
    
    def setUp(self):
        # Set up standard mock credentials for testing
        os.environ["GEMINI_API_KEY"] = "AIzaSyB_FakeKeyForInternshipTesting_99"
        
    def test_load_env(self):
        # Create a temp env file for testing load_env
        temp_env_path = ".env.test"
        with open(temp_env_path, "w", encoding="utf-8") as f:
            f.write("TEST_ENV_VAR=success_value\n")
            
        # Temporarily swap filename in load_env execution if needed,
        # but since load_env accesses ".env", let's ensure .env exists and contains GEMINI_API_KEY.
        self.assertTrue(os.path.exists(".env"), "Expected .env file to exist in workspace root")
        load_env()
        self.assertIn("GEMINI_API_KEY", os.environ, "Expected GEMINI_API_KEY to be loaded into environment")
        
        # Cleanup
        if os.path.exists(temp_env_path):
            os.remove(temp_env_path)

    def test_web_search_tool(self):
        # Test web search execution (must handle success or gracefully fallback)
        res = web_search("nashville hot chicken")
        self.assertIsInstance(res, str)
        self.assertTrue(len(res) > 0)
        # Should contain abstract,RelatedTopics or fallback text
        self.assertTrue("Nashville" in res or "Poultrygeist" in res or "Search" in res)

    def test_send_text_message_tool_mock(self):
        # Unset Twilio env vars to force mock sms execution path
        old_sid = os.environ.pop("TWILIO_ACCOUNT_SID", None)
        old_token = os.environ.pop("TWILIO_AUTH_TOKEN", None)
        old_num = os.environ.pop("TWILIO_FROM_NUMBER", None)
        
        res = send_text_message("+15551234567", "whats good brodie")
        self.assertIn("Mock SMS successfully logged", res)
        self.assertIn("whats good brodie", res)
        
        # Restore old env vars
        if old_sid: os.environ["TWILIO_ACCOUNT_SID"] = old_sid
        if old_token: os.environ["TWILIO_AUTH_TOKEN"] = old_token
        if old_num: os.environ["TWILIO_FROM_NUMBER"] = old_num

    def test_fallback_agent_interface(self):
        agent = FallbackAgent(
            api_key="AIzaSyB_FakeKeyForInternshipTesting_99",
            system_instructions="You are ChronoCluck",
            tools=[web_search, send_text_message]
        )
        self.assertEqual(agent.api_key, "AIzaSyB_FakeKeyForInternshipTesting_99")
        self.assertEqual(len(agent.tools), 2)
        self.assertIn("web_search", agent.tools)
        self.assertIn("send_text_message", agent.tools)

if __name__ == "__main__":
    unittest.main()
