import os
import json
from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from yt_dlp import YoutubeDL
from flask_cors import CORS

from datetime import timedelta

app = Flask(__name__)
CORS(app)

def format_seconds(seconds):
    return str(timedelta(seconds=int(seconds))).zfill(8)

def get_video_info(video_id):
    ydl_opts = {'quiet': True, 'skip_download': True}
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        return {
            "name": info.get("title"),
            "thumbnailUrl": {
                "hqdefault": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                "maxresdefault": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
            },
            "embedUrl": f"https://www.youtube.com/embed/{video_id}",
            "duration": str(info.get("duration")),
            "description": info.get("description"),
            "upload_date": info.get("upload_date"),
            "genre": info.get("categories")[0] if info.get("categories") else "N/A",
            "author": info.get("uploader"),
            "channel_id": info.get("channel_id")
        }

def fetch_transcripts(video_id, lang):
    language_name = ""
    transcript_entries = []

    try:
        transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcripts.find_transcript([lang])
        language_name = transcript.language

        entries = transcript.fetch()
        transcript_entries = [
            {
                "start": format_seconds(entry.start),
                "end": format_seconds(entry.start + entry.duration),
                "text": entry.text
            }
            for entry in entries
        ]

    except (TranscriptsDisabled, NoTranscriptFound):
        pass

    return transcript_entries, {lang: language_name}

def get_transcript(lang):
    video_id = request.args.get('videoId')

    if not video_id:
        return jsonify({"error": "Missing 'videoId' parameter."}), 400

    try:
        video_info = get_video_info(video_id)
        transcript_entries, language_map = fetch_transcripts(video_id, lang)

        response = {
            "videoId": video_id,
            "videoInfo": video_info,
            "language_code": [{"code": lang, "name": language_map.get(lang, "")}],
            "transcripts": {lang: transcript_entries}
        }

        # Save to file
        os.makedirs(f"../transcripts/{lang}", exist_ok=True)
        with open(f"../transcripts/{lang}/{video_id}.json", "w", encoding="utf-8") as f:
            json.dump(response, f, ensure_ascii=False, indent=2)

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ko', methods=['GET'])
def transcript_ko():
    return get_transcript('ko')

@app.route('/ja', methods=['GET'])
def transcript_ja():
    return get_transcript('ja')

@app.route('/zh', methods=['GET'])
def transcript_zh():
    return get_transcript('zh')

@app.route('/es', methods=['GET'])
def transcript_es():
    return get_transcript('es')

if __name__ == '__main__':
    app.run(debug=True)
