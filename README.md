# CM Sheet

A premium, interactive problem tracker for the CM Sheet, featuring real-time Codeforces progress synchronization and persistent manual tracking for other major platforms.

![CM Sheet Dashboard](https://github.com/aachintya/CMSheet/raw/main/frontend/public/vite.svg)

## 🚀 Features

-   **Codeforces Integration**: Automatically fetches your solved status using the Codeforces API.
-   **Multi-Platform Support**: Track problems across **AtCoder**, **CSES**, **LeetCode**, and more.
-   **Manual Progress Persistence**: Sign up and tick/untick problems on non-CF platforms. Your progress is saved in the cloud and follows you across devices.
-   **Rich UI/UX**:
    -   **Dark/Light Mode**: Smooth transitions between premium themes.
    -   **Rating-Wise Tiers**: Problems grouped by Codeforces rating (800 - 3500).
    -   **Progress Cards**: Visual progress bars for every category and platform.
    -   **Glassmorphism Design**: Modern, sleek interface built with Vanilla CSS.

## 🏆 Credits

This project uses the curated problem set from **Ask Senior**.
Special thanks to the **Ask Senior** team for providing the high-quality roadmap and problem selection that powers this sheet.
Check them out at [asksenior.in](https://www.asksenior.in/learn).

## 🛠️ Tech Stack

-   **Frontend**: React + Vite
-   **Backend**: Supabase (Auth & Database)
-   **Styling**: Pure CSS Variables + Glassmorphism
-   **API**: Codeforces Official API

## ⚙️ Setup & Deployment

The application is ready to be hosted on **Vercel**. 

### 1. Supabase Backend
To enable persistence, you need to set up a Supabase project. Follow the detailed steps in:
👉 [Supabase Setup Guide](frontend/supabase_setup.md)

### 2. Environment Variables
Create a `.env` file in the `frontend` directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Local Development
```bash
cd frontend
npm install
npm run dev
```

## 📄 License

This project is intended for educational and personal progress tracking purposes.