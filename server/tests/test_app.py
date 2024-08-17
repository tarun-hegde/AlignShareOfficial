import os
import pytest
from fastapi.testclient import TestClient
from app import app, HF_TOKEN, NEWS_API_KEY

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert isinstance(response.text, str)

def test_generate_image_successful():
    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        request_payload = {
            "prompt": "Latest news updates for Apple Inc."
        }
        response = client.post("/generate-image/", json=request_payload)
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

def test_generate_image_invalid_request():
    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        # Testing with an empty prompt
        request_payload = {
            "prompt": ""
        }
        response = client.post("/generate-image/", json=request_payload)
        assert response.status_code == 400
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

def test_add_borders():
    from app import add_borders
    from PIL import Image
    # Create a simple image
    image = Image.new("RGB", (100, 100), color=(73, 109, 137))
    image_with_borders = add_borders(image)
    
    assert image_with_borders.size == (120, 120)  # 10 pixels border on each side

def test_text_summarizer():
    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        from app import text_summarizer
        text = "This is a test text for summarization."
        summary = text_summarizer(text)
        
        assert isinstance(summary, list)
        assert "summary_text" in summary[0]
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

if __name__ == "__main__":
    pytest.main()