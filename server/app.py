import logging
from huggingface_hub import InferenceClient
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
import random
from starlette.middleware.cors import CORSMiddleware
import os
from schema import ImageCreate, PostRequest
from json.decoder import JSONDecodeError
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from dotenv import load_dotenv


load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

HF_TOKEN = os.getenv("HF_TOKEN")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
summarizer_url = "https://api-inference.huggingface.co/models/utrobinmv/t5_summary_en_ru_zh_base_2048"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}
client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.3",
    token=HF_TOKEN,
    headers=headers,
)




@app.get("/")
def read_root() -> str:
    companies = [
        "Apple",
        "Google",
        "Microsoft",
        "Amazon",
        "Facebook",
        "Tesla",
        "Netflix",
        "Twitter",
        "Uber",
        "Lyft",
        "Airbnb",
        "Zoom",
        "Slack",
        "Shopify",
        "Spotify",
        "Pinterest",
        "Snapchat",
        "TikTok",
        "Reddit",
        "LinkedIn",
    ]
    random_company = random.choice(companies)
    logger.info(f"Selected company: {random_company}")
    selected_company = random_company

    news_url = f"https://newsapi.org/v2/everything?q={selected_company}&from=2024-08-13&language=en&sortBy=publishedAt&apiKey={NEWS_API_KEY}"

    response = requests.get(news_url)
    new_response = response.json()
    size = len(new_response["articles"])
    if size > 0:
        data = new_response["articles"][size - 1]["description"]
    else:
        data = ""
    return data


@app.post("/generate-image/")
def generate_image(request: ImageCreate):
    logger.info(f"Received request: {request}")
    payload = {
        "inputs": f"Create a program that utilizes stable diffusion to fetch real-time updates as stated in {request.prompt}, dynamically generating visually appealing images representing these updates. The generated images should succinctly summarize the latest news and developments for the company, ready for seamless posting on their respective social media feeds."
    }
    logger.info(f"Payload for API: {payload}")

    response = requests.post(api_url, headers=headers, json=payload)
    logger.info(f"Response status code: {response.status_code}")

    if response.status_code == 200:
        try:
            if response.content:
                image_data = response.content
                image = Image.open(BytesIO(image_data))
                new_text = text_summarizer(request.prompt)
                logger.info(f"Summarized text: {new_text}")
                image_with_text = add_text_to_image(image, new_text[0]["summary_text"])
                image_with_border = add_borders(image_with_text)

                # Ensure the assets directory exists
                assets_dir = "assets"
                if not os.path.exists(assets_dir):
                    os.makedirs(assets_dir)
                # Save the image or handle it as needed
                image_path = os.path.join(assets_dir, "generated_image.png")
                image_with_border.save(image_path, "PNG")
                buffer = BytesIO()
                image_with_border.save(buffer, format="PNG")
                buffer.seek(0)
                return StreamingResponse(buffer, media_type="image/png")
            else:
                logger.error("Empty response from the API")
                raise HTTPException(
                    status_code=500, detail="Empty response from the API"
                )
        except (JSONDecodeError, KeyError) as e:
            logger.error(f"Error decoding image data: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to decode the image data from the response",
            )
    else:
        logger.error(f"API request failed with status code: {response.status_code}")
        raise HTTPException(status_code=response.status_code, detail=response.json())


def add_borders(image: Image):
    border_color = (10, 30, 40)
    border_width = 10
    width, height = image.size
    new_width = width + 2 * border_width
    new_height = height + 2 * border_width
    image_with_border = Image.new("RGB", (new_width, new_height), border_color)
    image_with_border.paste(image, (border_width, border_width))

    # Draw borders on the image
    draw = ImageDraw.Draw(image_with_border)
    draw.rectangle(
        [(0, new_width // 4), (new_width - 1, new_height - 1)],
        outline=border_color,
        width=border_width,
    )

    return image_with_border


def text_summarizer(text: str):
    payload = {"inputs": text}
    response = requests.post(summarizer_url, headers=headers, json=payload)
    logger.info(f"Summarizer response status code: {response.status_code}")
    if response.status_code == 200:
        try:
            if response.content:
                return response.json()
            else:
                logger.error("Empty response from the summarizer API")
                raise HTTPException(
                    status_code=500, detail="Empty response from the API"
                )
        except (JSONDecodeError, KeyError) as e:
            logger.error(f"Error decoding summarizer data: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to decode the image data from the response",
            )
    else:
        logger.error(f"Summarizer API request failed with status code: {response.status_code}")
        raise HTTPException(status_code=response.status_code, detail=response.json())


def add_text_to_image(image: Image, text: str):
    width, height = image.size
    text_position = (10, 10)
    # It should be font_path = "./public/Sanseriffic.otf" while running in local
    font_path = "server/public/Sanseriffic.otf"
    font_size = 55
    try:
        font = ImageFont.truetype(font_path, font_size)
    except OSError:
        logger.error("Font resource not found")
        raise HTTPException(status_code=500, detail="Font resource not found")
    formatted_text = add_line_breaks(text)
    # Determine the size of the text
    text_width, text_height = width, height

    # Image with bg
    text_image = Image.new("RGB", (text_width, text_height // 4), color="white")

    # Draw the text on the new image
    text_draw = ImageDraw.Draw(text_image)
    text_draw.text((0, 0), formatted_text, fill="black", font=font)

    # Paste the text image onto the original image at the specified position
    image.paste(text_image, text_position)

    return image


def add_line_breaks(text: str):
    try:
        words = text.split()
        new_text = ""
        for i, word in enumerate(words):
            new_text += word
            if (i + 1) % 6 == 0:
                new_text += "\n"
            else:
                new_text += " "

        return new_text
    except AttributeError as e:
        logger.error(f"Error occurred during line break addition: {e}")
        raise Exception(f"Error occurred during line break addition: {e}")

@app.post("/generate-posts/")
def generate_posts(request: PostRequest)  :

    if not request.text.strip():
        raise HTTPException(status_code=422, detail="Text field cannot be empty")
    if not request.name.strip():
        raise HTTPException(status_code=422, detail="Name field cannot be empty")
    if not request.industry.strip():
        raise HTTPException(status_code=422, detail="Industry field cannot be empty")

    linkedin_post = generate_linkedin_post(request.text, request.name, request.industry)
    twitter_post = generate_twitter_post(request.text, request.name, request.industry)
    insta_post = generate_insta_post(request.text, request.name, request.industry)
    
    return {
        "linkedin_post": linkedin_post,
        "twitter_post": twitter_post,
        "insta_post": insta_post,
    }

def generate_linkedin_post(text: str, name: str, industry: str):
    prompt = (
        f"Write a LinkedIn post for {name}, a company in the {industry} industry. "
        f"The post should be professional, engaging, and informative. "
        f"Highlight the latest news and developments specified in the following text: {text}. "
        f"Include hashtags"
    )
    
    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = client.chat_completion(
            messages=messages,
            max_tokens=500,
            stream=False,
        )
        generated_text = response.choices[0].message.content
        print(generated_text)
        return generated_text
    except Exception as e:
        print(f"Error generating LinkedIn post: {e}")
        raise

def generate_twitter_post(text: str, name: str, industry: str):
    prompt = (
        f"Write a tweet for {name}, a company in the {industry} industry. "
        f"Highlight the latest news and developments specified in the following text: {text}. "
        f"Include hashtags based on name and industry"
    )
    
    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = client.chat_completion(
            messages=messages,
            max_tokens=500,
            stream=False,
        )
        generated_text = response.choices[0].message.content
        print(generated_text)
        return generated_text
    except Exception as e:
        print(f"Error generating LinkedIn post: {e}")
        raise

def generate_insta_post(text: str, name: str, industry: str):
    prompt = (
        f"Write an Instagram post for {name}, a company in the {industry} industry. "
        f"The post should be engaging, and informative. "
        f"Highlight the latest news and developments specified in the following text: {text}. "
        f"Include hashtags based on name and industry"
    )
    
    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = client.chat_completion(
            messages=messages,
            max_tokens=500,
            stream=False,
        )
        generated_text = response.choices[0].message.content
        print(generated_text)
        return generated_text
    except Exception as e:
        print(f"Error generating LinkedIn post: {e}")
        raise


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
