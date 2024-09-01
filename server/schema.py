from typing import Optional

import pydantic as pydantic


class PromptBase(pydantic.BaseModel):
    """Base class for prompts"""

    seed: Optional[int] = 992446758
    num_inference_steps: int = 10
    guidance_scale: float = 6.0


class ImageCreate(PromptBase):
    """Image creation prompt"""

    prompt: str


class PostRequest(pydantic.BaseModel):
    """Post request payload"""

    text: str
    name: str
    industry: str
