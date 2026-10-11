import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="BMW Quality Dashboard API")


class InvestigationRequest(BaseModel):
    defect_id: str
    defect_name: str
    category: str
    station: str
    car_model: str
    severity: int = Field(ge=1, le=10)
    resolution_status: str
    report_date: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/investigate")
def investigate(data: InvestigationRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key is missing"
        )

    try:
        client = OpenAI(timeout=30.0, max_retries=1)

        response = client.responses.create(
            model="gpt-4.1-mini",
            instructions="""
                You are an assistant for automotive quality engineers.

                An engineer has flagged one defect for investigation.

                Suggest exactly three practical investigation steps
                for this specific type of defect.

                Rules:
                - Use the provided defect details as context.
                - Do not invent facts about this vehicle.
                - Do not claim to have identified the root cause.
                - Severity 1 is most critical; 10 is least critical.
                - Keep suggestions short and understandable.
                - Explain what an engineer should check, not what
                  definitely went wrong.
                - Return a numbered list in plain text.
                """,
            input=data.model_dump_json(),
            max_output_tokens=400,
            store=False,
        )

        return {"suggestions": response.output_text}

    except OpenAIError:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate AI suggestions"
        )
