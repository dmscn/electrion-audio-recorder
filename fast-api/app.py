import os
import json
import tempfile
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import whisper
from kokoro import KPipeline
import soundfile as sf
import numpy as np

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies and other credentials
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load the Whisper model once at startup (choose model size as needed)
whisper_model = whisper.load_model("base")  # Options: base, small, etc.

def transcribe_audio(file_path: str) -> str:
    """Uses the Whisper model to transcribe the given audio file."""
    result = whisper_model.transcribe(file_path)
    return result.get("text", "").strip()

def get_ollama_response(prompt: str, model: str = "default-model") -> str:
    """
    Sends a POST request to the locally running Ollama API to generate a response.
    Adjust the URL and payload as needed.
    """
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(url, headers=headers, json=payload)
    try:
        json_resp = response.json()
        return json_resp.get("response", response.text)
    except Exception:
        return response.text

def synthesize_speech_kokoro(text: str, output_path: str, lang_code: str, voice: str):
    """
    Uses the Kokoro TTS pipeline to synthesize speech from text.
    - lang_code: The parsed language code ('a', 'b', 'e', or 'p').
    - voice: The voice identifier based on the language.
    """
    pipeline = KPipeline(lang_code=lang_code)
    generator = pipeline(text, voice=voice, speed=1, split_pattern=r'\n+')
    segments = []
    for gs, ps, audio in generator:
        segments.append(audio)

    if segments:
        audio_data = np.concatenate(segments)
        sf.write(output_path, audio_data, 24000)
    else:
        raise Exception("No audio was generated by Kokoro.")

@app.post("/process_audio")
async def process_audio(
    audio: UploadFile = File(...),
    model: str = Form("llama3.1:8b"),  # Default model is "llama3.1:8b"
    language: str = Form("en-us")       # Default language is "en-us"
):
    # Define language mapping for Kokoro:
    lang_map = {"en-us": "a", "en-gb": "b", "es": "e", "pt-br": "p"}
    # Define voice mapping based on language:
    voice_map = {"en-us": "af_heart", "en-gb": "bf_emma", "es": "ef_dora", "pt-br": "pf_dora"}

    language_lower = language.lower()
    if language_lower not in lang_map:
        raise HTTPException(
            status_code=400,
            detail="Invalid language parameter. Accepted values: en-us, en-gb, es, pt-br."
        )
    lang_code = lang_map[language_lower]
    voice = voice_map[language_lower]

    # Save the uploaded audio file to a temporary location.
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        file_path = tmp.name
        contents = await audio.read()
        tmp.write(contents)

    try:
        # 1. Transcribe the audio using Whisper.
        transcription = transcribe_audio(file_path)
        print("Transcription:", transcription)

        # 2. Get the AI response from Ollama.
        ai_response = get_ollama_response(transcription, model)
        print("Ollama Response:", ai_response)

        # 3. Synthesize the AI response into an audio file using Kokoro.
        output_audio_path = file_path + "_synthesized.wav"
        synthesize_speech_kokoro(ai_response, output_audio_path, lang_code=lang_code, voice=voice)

        # 4. Return the synthesized audio file to the client.
        return FileResponse(output_audio_path, media_type="audio/wav", filename="response.wav")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
