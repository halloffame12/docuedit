# DocuEdit Ultra - Neural Forensic Document Suite

**DocuEdit Ultra** is a high-fidelity document manipulation platform that combines forensic-grade OCR analysis with neural inpainting to modify physical document text seamlessly. Unlike traditional editors, it reconstructs the underlying paper grain and ink viscosity to ensure edits are indistinguishable from the original.

![DocuEdit Ultra Preview](https://img.shields.io/badge/Neural-Forensics-teal?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)

---

## 🚀 Key Features

- **Forensic Optical Analysis**: Maps document geometry, ink chromatography, and paper surface texture using Gemini 3 Flash.
- **Neural Inpainting**: Replaces targeted text blocks while synthesizing original paper grain and ink bleeds using Gemini 2.5 Flash Image.
- **Microscopic DPI Matching**: Ensures character spacing, font weight, and stroke pressure match the surrounding context.
- **Zero-Trace Synthesis**: Designed for high-resolution document reconstruction with no digital seams or blurring.
- **Responsive Terminal Interface**: A classic, cool "Midnight & Mint" aesthetic optimized for desktop, tablet, and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **AI Engine**: Google Gemini API (@google/genai)
  - `gemini-3-flash-preview` for forensic document mapping.
  - `gemini-2.5-flash-image` for neural surface reconstruction (inpainting).
- **Icons**: Lucide React
- **Typography**: Playfair Display (Serif) & Inter (Sans)

---

## 🧬 System Architecture

1. **Ingestion**: User uploads a document scan (PNG/JPG).
2. **Forensic Mapping**: The system performs a "Micro-DPI Scan" to identify bounding boxes, ink type (ballpoint, laser-print, etc.), and hex color signatures.
3. **Payload Definition**: The user selects a neural block and inputs the new text payload.
4. **Neural Reconstruction**: The AI engine performs a microscopic reconstruction of the targeted coordinates, layering new ink over synthesized paper grain.
5. **Finalization**: The system outputs a high-resolution, flattened image ready for forensic export.

---

## 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/halloffame12/docuedit-ultra.git
   cd docuedit-ultra
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 🤝 Contact & Author

Developed with a focus on high-fidelity AI applications and modern UI/UX.

**Sumit Chauhan**  
Senior Frontend Engineer & AI Specialist

- **Portfolio**: [sumitchauhandev.netlify.app](https://sumitchauhandev.netlify.app/)
- **GitHub**: [@halloffame12](https://github.com/halloffame12)
- **LinkedIn**: [Sumit Chauhan](https://www.linkedin.com/in/sumit-chauhan-a4ba98325/)

---

## ⚖️ Disclaimer

*This tool is intended for professional document restoration and forensic research purposes only. Unauthorized modification of official documents may be subject to legal consequences in your jurisdiction.*
