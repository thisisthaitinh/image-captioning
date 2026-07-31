from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    AutoTokenizer, AutoModelForSeq2SeqLM
)
import torch
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Initialize device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load BLIP image captioning model
blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-large",
    use_fast=False
)
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-large"
).to(device)

# Load English-Vietnamese translation model
translation_model_name = "VietAI/envit5-translation"
translation_tokenizer = AutoTokenizer.from_pretrained(translation_model_name)
translation_model = AutoModelForSeq2SeqLM.from_pretrained(
    translation_model_name).to(device)


def translate_to_vietnamese(text):
    """Translate English text to Vietnamese"""
    input = [f"en: {text}"]
    try:

        # Generate translation
        gen = translation_model.generate(translation_tokenizer(
            input,
            return_tensors="pt",
            padding=True
        ).input_ids.to(device), max_length=512)

        # Decode output
        translated = translation_tokenizer.batch_decode(
            gen,
            skip_special_tokens=True
        )[0]

        if (translated.startswith("vi: ")):
            translated = translated[4:].strip()
        return translated
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return None


@app.route('/caption', methods=['POST'])
def generate_caption():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        # Process image
        image_file = request.files['image']
        image = Image.open(io.BytesIO(image_file.read()))

        if image.mode != "RGB":
            image = image.convert(mode="RGB")

        # Generate caption
        inputs = blip_processor(image, return_tensors="pt").to(device)
        output = blip_model.generate(**inputs)
        caption = blip_processor.decode(output[0], skip_special_tokens=True)

        # Check if translation is requested
        translate = request.form.get('translate', 'false').lower() == 'true'

        if translate:
            # Translate caption to Vietnamese
            translated = translate_to_vietnamese(caption)

            if translated:
                return jsonify({
                    'caption': caption,
                    'translation': translated,
                    'language': 'vi'
                })
            else:
                return jsonify({
                    'caption': caption,
                    'warning': 'Translation failed'
                })

        return jsonify({'caption': caption})

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to process image'
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
