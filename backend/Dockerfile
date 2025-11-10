FROM python:3.11-slim

# Create app directory
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Copy backend source
COPY . /app

# Expose port used by uvicorn
EXPOSE 8000

# Run the app with --reload for dev convenience
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
