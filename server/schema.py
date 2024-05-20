import pydantic as pydantic
from typing import Optional

class PromptBase(pydantic.BaseModel):
    seed: Optional[int] = 42
    num_inference_steps: int = 10
    guidance_scale: float = 10.0


class ImageCreate(PromptBase):
    prompt: str