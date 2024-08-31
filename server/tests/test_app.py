import pytest
from fastapi.testclient import TestClient
from app import app, HF_TOKEN

client = TestClient(app)

PAYLOADS = {
    "generate_image": {"prompt": "Latest news updates for Apple Inc."},
    "posts": {
        "text": "We aim to streamline the content sharing process for companies by automating the generation and posting of updates across social media platforms. By leveraging real-time fetching of updates from company websites, an AI-powered content generator, and direct social media integration, AlignShare ensures that companies can effortlessly keep their audience informed and engaged with the latest news and announcements.",
        "name": "AlignShare",
        "industry": "Technology"
    }
}

def test_read_root():
    """Test the root endpoint."""
    response = client.get("/automate-prompt/")
    assert response.status_code == 200
    assert isinstance(response.text, str)


def test_generate_image_successful():
    """Test the generate-image endpoint."""
    
    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        response = client.post("/generate-image/", json=PAYLOADS["generate_image"])
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")


def test_generate_image_invalid_request():
    """Test the generate-image endpoint with an invalid request."""
    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        # Testing with an empty prompt
        request_payload = {"prompt": ""}
        response = client.post("/generate-image/", json=request_payload)
        assert response.status_code == 400
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")


def test_add_borders():
    """Test the add_borders function."""

    from app import add_borders
    from PIL import Image

    # Create a simple image
    image = Image.new("RGB", (100, 100), color=(73, 109, 137))
    image_with_borders = add_borders(image)

    assert image_with_borders.size == (120, 120)  # 10 pixels border on each side


def test_text_summarizer():
    """Test the text_summarizer function."""

    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        from app import text_summarizer

        text = "This is a test text for summarization."
        summary = text_summarizer(text)

        assert isinstance(summary, list)
        assert "summary_text" in summary[0]
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

def test_generate_linkedin_post():
    """Test the generate_linkedin_post function."""
    

    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        from app import generate_linkedin_post
        post = generate_linkedin_post(PAYLOADS["posts"]["text"], PAYLOADS["posts"]["name"] , PAYLOADS["posts"]["industry"])

        assert isinstance(post, str)
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

def test_generate_twitter_post():
    """Test the generate_twitter_post function."""

    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        from app import generate_twitter_post
        post = generate_twitter_post(PAYLOADS["posts"]["text"], PAYLOADS["posts"]["name"] , PAYLOADS["posts"]["industry"])

        assert isinstance(post, str)
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")

def test_generate_instagram_post():
    """Test the generate_insta_post function."""
    

    if HF_TOKEN:  # Ensure the HF_TOKEN is set
        from app import generate_insta_post
        post = generate_insta_post(PAYLOADS["posts"]["text"], PAYLOADS["posts"]["name"] , PAYLOADS["posts"]["industry"])

        assert isinstance(post, str)
    else:
        pytest.skip("HF_TOKEN is not set, skipping this test.")


if __name__ == "__main__":
    pytest.main()
