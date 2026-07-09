FROM python:3.12-slim

# Install curl for debugging
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*


# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install dependencies as the user
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Copy backend source
COPY --chown=user . $HOME/app

# Expose port used by Hugging Face Spaces
EXPOSE 7860

# Run the app mapping to the correct source path
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "7860"]
