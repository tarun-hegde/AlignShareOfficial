from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import StreamingResponse
import requests
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from schema import ImageCreate
from json.decoder import JSONDecodeError
from PIL import Image
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

#
@app.get("/")
def read_root():
    return {"message": "Welcome to AlignShare"}

@app.post("/generate-image/")
async def generate_image(request: ImageCreate):
    payload = {
     "inputs": f"I'm brainstorming a post for social media. Here's the idea: {request.prompt}"
    }

    response = requests.post(api_url, headers=headers, json=payload)

    if response.status_code == 200:
        try:
          if response.content:
            image_data = response.content
            image = Image.open(BytesIO(image_data))
            
            # Save the image or handle it as needed
            image_path = "assets/generated_image.png"
            image.save(image_path, "PNG")

            return StreamingResponse(BytesIO(image_data), media_type="image/png")
          else:
            raise HTTPException(status_code=500, detail="Empty response from the API")
        except (JSONDecodeError, KeyError) as e:
            print(e)
            raise HTTPException(status_code=500, detail="Failed to decode the image data from the response")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.json())

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
