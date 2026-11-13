# AI Time Travelers — Phase 1

A minimal single-page Three.js prototype: enter a 1925 study, walk with WASD + mouse, approach the placeholder scientist avatar, press **E**, and chat in Egyptian Arabic through a Vercel serverless API.

## Requirements

- Node.js 20.19+ (or a current Node.js release supported by Vite)
- An Anthropic API key
- A desktop browser with WebGL and Pointer Lock support

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file by copying `.env.example` to `.env.local`, then add your Anthropic key:

   ```env
   ANTHROPIC_API_KEY=your_real_key
   ```

3. Start Vite:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite.

   **Important:** Vite alone does not execute `/api/chat.js`. To test the chat endpoint locally, use the Vercel CLI:

   ```bash
   npm install -g vercel
   vercel dev
   ```

   Run `vercel dev` from the project directory after adding `.env.local`. Use the URL printed by Vercel.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository in the Vercel dashboard.
3. In **Project Settings → Environment Variables**, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
   - Environments: Development, Preview, Production as needed
4. Deploy. Vercel detects Vite and the `/api/chat.js` serverless function.
5. Open the deployed site and test the conversation.

Do not commit `.env.local` or expose the API key in frontend code. The browser only calls `/api/chat`.

## Controls

- **W / A / S / D:** walk
- **Mouse:** look around (click “ابدأ التجوّل” to enable pointer lock)
- **E:** start a conversation when close to the avatar
- **Esc:** release the mouse; close the chat using its × button
- **رجوع:** return to the landing page

## Phase 1 notes

- The scientist model is a public Three.js `Soldier.glb` sample used strictly as a temporary humanoid placeholder; it is not an Einstein likeness. Replace `MODEL_URL` in `src/einstein.js` with a properly licensed Einstein GLB later.
- The landing portrait is a designed placeholder, not a real photo.
- Voice, lip sync, multiple scientists, and interactive object handling are intentionally excluded.
- Mobile displays a desktop-recommended message; the 3D controls are intended for desktop.
- The server function uses the requested model name `claude-sonnet-4-5`. If Anthropic reports that model identifier as unavailable for your account, update the `model` value in `api/chat.js` to an enabled Claude Sonnet model ID.
- This prototype sends the current conversation history to Anthropic. For a public production launch, add rate limiting, abuse protection, and stricter request-size limits.
