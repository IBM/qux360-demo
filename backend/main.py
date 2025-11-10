from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Submission(BaseModel):
    name: str
    email: str
    preference: str

class SubmissionOut(Submission):
    id: int
    message: str

submissions: List[SubmissionOut] = []

@app.post("/process")
def process(submission: Submission):
    message = f"Thanks, {submission.name}! You chose {submission.preference}."
    new = SubmissionOut(id=len(submissions) + 1, **submission.dict(), message=message)
    submissions.append(new)
    return {"message": message}

@app.get("/submissions", response_model=List[SubmissionOut])
def get_submissions():
    return submissions
