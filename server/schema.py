import pydantic as pydantic
from typing import Optional

class PromptBase(pydantic.BaseModel):
    seed: Optional[int] = 992446758
    num_inference_steps: int = 10
    guidance_scale: float = 6.0


class ImageCreate(PromptBase):
    prompt: str