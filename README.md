# FinTrack MVP with Firebase Studio

This is a Next.js application for tracking personal finances, built with Firebase Studio.

## Getting Started

To run the development server locally, you'll need to set up your environment variables first.

1.  **Create an environment file:**
    Copy the `.env.example` file to a new file named `.env`. In VS Code, you can simply right-click the file and choose "Duplicate".

2.  **Set your environment variables:**
    Open the `.env` file and add your MongoDB connection string and your Gemini API Key.

    ```
    MONGODB_URI="your_mongodb_connection_string"
    GEMINI_API_KEY="your_gemini_api_key"
    ```

3.  **Install dependencies and run the project:**
    Open the built-in terminal in VS Code (`View > Terminal`), and run the following commands:

    ```bash
    npm install
    npm run dev
    ```

The `npm run dev` command will now start both the Next.js frontend and the Genkit AI backend for you.

The application will be available at [http://localhost:9002](http://localhost:9002).
