from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import requests
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
api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

@app.get("/")
def read_root():
    return {"message": "Welcome to AlignShare"}

@app.post("/generate-image/")
async def generate_image(request: ImageCreate):
    payload = {
        "inputs": f"Brainstorm a post for social media. Here's the idea: {request.prompt}"
    }

    response = requests.post(api_url, headers=headers, json=payload)

    if response.status_code == 200:
        try:
            if response.content:
                image_data = response.content
                image = Image.open(BytesIO(image_data))
                image_with_text = add_text_to_image(image, request.prompt)
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
    text_position = (10, height // 6)
    font_path = "./public/Sanseriffic.otf"  
    font_size = 36
    font = ImageFont.truetype(font_path, font_size)
    draw.text(text_position, text, fill="white", font=font)
    return image
