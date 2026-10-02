# Evaluation & Feature Demonstration

This document demonstrates the working functionality of the AI Vision App features.

## 1. Image Upload
**Description:** Users can upload images (JPEG/PNG) which are securely stored in AWS S3 and recorded in the PostgreSQL database.
**Input:** User selects a file named `landscape.jpg`.
**Output:** Toast notification confirms upload; image appears in the gallery.
**Screenshot:** /docs/upload.png


## 2. Image Analysis (Captioning, VQA, OCR)
**Description:** The app uses OpenAI's Vision model to analyze uploaded images.
**Input:** * **Caption:** Click "Generate Caption" on an image of a dog.
* **VQA:** Ask "What color is the car?"
**Output:** * **Caption Result:** "A golden retriever playing in the park."
* **VQA Result:** "The car is red."
**Screenshot:** /docs - caption_analysis.png caption_output.png ,/docs - vqa_analysis.png vqa_output.png, /docs - ocr_analysis 


## 3. Text-to-Image Generation
**Description:** Users can generate new images from text prompts using Stable Diffusion XL via Hugging Face.
**Input:** Prompt: "A cyberpunk city at night with neon rain."
**Output:** A generated image matching the description is displayed and saved to the gallery.
**Screenshot:** /docs - text_to_image.png


## 4. Image Variation
**Description:** Users can generate variations of an existing image using image-to-image processing.
**Input:** Select an existing image and provide a prompt adjustment.
**Output:** A new version of the image adhering to the prompt is generated.
**Screenshot:** /docs - Image_var.png


## 5. Data Persistence
**Description:** Verification that data is stored correctly.
**Evidence:**
* **S3 Bucket:** Screenshot of the S3 bucket listing showing uploaded/generated files.
* **Database:** Screenshot of the `media_assets` table in PostgreSQL.
**Screenshot:** /docs - db1.png db2.png db3.pn s3_1.png s3_2.png s3_1.png

