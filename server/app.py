from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
import random
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from schema import ImageCreate
from json.decoder import JSONDecodeError
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware, 
    allow_credentials=True, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

HF_TOKEN = os.getenv('HF_TOKEN')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
summarizer_url = "https://api-inference.huggingface.co/models/utrobinmv/t5_summary_en_ru_zh_base_2048"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

@app.get("/")
def read_root() -> str:
    companies=["Apple","Google","Microsoft","Amazon","Facebook"
               ,"Tesla","Netflix","Twitter","Uber","Lyft",
               "Airbnb","Zoom","Slack","Shopify","Spotify",
               "Pinterest","Snapchat","TikTok","Reddit","LinkedIn"]
    random_company = random.choice(companies)
    print(random_company)
    selected_company = random_company
    news_url=f"https://newsapi.org/v2/everything?q={selected_company}&from=2024-05-23&language=en&sortBy=publishedAt&apiKey={NEWS_API_KEY}"
    response = requests.get(news_url)
    new_response=response.json()
    size=len(new_response['articles'])
    if size>0:
     data=new_response['articles'][size-1]['description']
    else :
       data=""
    return data

@app.post("/generate-image/")
async def generate_image(request: ImageCreate):
    print(request)
    payload = {
        "inputs": f"Create a high-quality, realistic image for a social media post announcing a new product launch for a tech company. The image should be modern and sleek, with a professional look. Include elements like a futuristic device, clean lines, and vibrant colors. Ensure the company's logo is prominently displayed in a corner of the image. The background should be minimalistic yet sophisticated, with a hint of technological elements like circuit patterns or abstract digital graphics.Example Post Text,:🚀 Exciting News! 🚀 [Company]! is thrilled to announce the launch of our latest product, [Product Name]! This cutting-edge technology is designed to revolutionize the way you [product function]. Stay tuned for more updates and be among the first to experience the future of innovation. #TechLaunch #Innovation #FutureIsHere,for the following update: {request.prompt}"
    }
    print(request.prompt)

    response = requests.post(api_url, headers=headers, json=payload)

    if response.status_code == 200:
        try:
            if response.content:
                image_data = response.content
                image = Image.open(BytesIO(image_data))
                new_text= text_summarizer(request.prompt)
                print(new_text)
                image_with_text = add_text_to_image(image, new_text[0]['summary_text'])
                image_with_border = add_borders(image_with_text)
                # Save the image or handle it as needed
                image_path = "assets/generated_image.png"
                image_with_border.save(image_path, "PNG")
                buffer = BytesIO()
                image_with_border.save(buffer, format='PNG')
                buffer.seek(0)
                return StreamingResponse(buffer, media_type="image/png")
            else:
                raise HTTPException(status_code=500, detail="Empty response from the API")
        except (JSONDecodeError, KeyError) as e:
            print(e)
            raise HTTPException(status_code=500, detail="Failed to decode the image data from the response")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.json())

def add_borders(image: Image):
    border_color = (0, 0, 0)  
    border_width = 10  
    width, height = image.size
    new_width = width + 2 * border_width
    new_height = height + 2 * border_width
    image_with_border = Image.new("RGB", (new_width, new_height), border_color)
    image_with_border.paste(image, (border_width, border_width))
    
    # Draw borders on the image
    draw = ImageDraw.Draw(image_with_border)
    draw.rectangle([(0, 0), (new_width-1, new_height-1)], outline=border_color, width=border_width)
    
    return image_with_border

def add_text_to_image(image: Image, text: str):
    draw = ImageDraw.Draw(image)
    width, height = image.size
    text_position = (10, height // 10)
    font_path = "./public/Sanseriffic.otf"  
    font_size = 36
    font = ImageFont.truetype(font_path, font_size)
    formatted_text = add_line_breaks(text)
    draw.text(text_position, formatted_text, fill="white", font=font)
    return image

def text_summarizer(text: str):
    payload = {
        "inputs": text,
        "parameters": {
            "max_length": min(len(text),30)
        }
    }
    response = requests.post(summarizer_url, headers=headers, json=payload)
    if response.status_code == 200:
        try:
            if response.content:
                return response.json()
            else:
                raise HTTPException(status_code=500, detail="Empty response from the API")
        except (JSONDecodeError, KeyError) as e:
            print(e)
            raise HTTPException(status_code=500, detail="Failed to decode the image data from the response")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.json())

def add_line_breaks(text:str):
    try:
        words = text.split()
        new_text = ''
        for i, word in enumerate(words):
            new_text += word
            if (i+1) % 8 == 0:
                new_text += '\n'
            else:
                new_text += ' '

        return new_text
    except AttributeError as e:
        raise Exception(f"Error occurred during line break addition: {e}")