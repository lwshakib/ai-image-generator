# AI Image Generator

Unleash your creativity! Instantly generate stunning artwork using the power of artificial intelligence. Enter a prompt and watch your imagination come to life. This project provides a full-stack AI art generator web app with user authentication, image gallery, favorites, and a developer API.

## Features

- **Instant Art Generation:** Generate beautiful artwork in seconds using advanced AI models (OpenAI, Gemini).
- **High-Resolution Output:** Download your creations in high resolution, perfect for sharing or printing.
- **Prompt Enhancement:** Improve your prompts for better results using AI.
- **Developer API:** Integrate AI art generation into your own apps with easy-to-use endpoints.
- **User Accounts:** Sign up, log in, and manage your creations and favorites.
- **Premium Plans:** Unlock higher limits and premium features by upgrading your plan.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Radix UI, Clerk Auth
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **AI Models:** OpenAI (image generation), Google Gemini (prompt enhancement)
- **Other:** Zustand, Sonner, TypeScript

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lwshakib/ai-image-generator
   cd ai-image-generator
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
   GEMINI_API_KEY=your_google_gemini_api_key
   NEBIUS_API_KEY=your_openai_or_nebius_api_key
   NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```
4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
6. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Database Models

See [`prisma/schema.prisma`](prisma/schema.prisma) for full details. Main models:

- **User:** Auth, credits, profile
- **Image:** Generated images, prompt, metadata
- **Favorite:** User favorites

## API Endpoints

- `POST /api/generate-image` — Generate an image from a prompt
  - Body: `{ prompt, negativePrompt, width, height, seed, responseExt, numInferenceSteps }`
- `POST /api/prompt` — Enhance a prompt using AI
  - Body: `{ prompt }`
- `GET /api/user/creations` — Get current user's generated images
- `GET/POST/DELETE /api/user/favorites` — Manage user favorites
- `GET /api/user` — Get all images (admin/dev)

## Usage

- Enter a prompt and generate images instantly.
- Enhance your prompt for better results.
- Download, share, and favorite your creations.
- Upgrade your plan for more features and higher limits.

## License

MIT

## Demo

![AI Image Generator Demo](assets/demo.gif)

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub (or GitLab/Bitbucket).**
2. **Go to [Vercel](https://vercel.com) and create a new project.**
   - Import your repository.
   - Set the environment variables in the Vercel dashboard (same as in your `.env` file).
   - Deploy the project.

### Custom Domains

To use your own domains (e.g., `domain.com` and `app.domain.com`):

1. **Add Domains in Vercel:**
   - In your Vercel project dashboard, go to the "Domains" tab.
   - Add `domain.com` and `app.domain.com`.
2. **Configure DNS on Namecheap:**
   - Log in to your Namecheap account and go to Domain List > Manage for your domain.
   - Under the "Advanced DNS" tab, add the following records:
     - **For root domain (`domain.com`):**
       - Add a CNAME or ALIAS record pointing to your Vercel domain (e.g., `cname.vercel-dns.com`).
     - **For subdomain (`app.domain.com`):**
       - Add a CNAME record for `app` pointing to your Vercel domain (e.g., `cname.vercel-dns.com`).
   - Vercel will show you the exact values to use for each record.
3. **Verify on Vercel:**
   - After updating DNS, return to Vercel and verify the domains. Propagation may take a few minutes to a few hours.

Your app will now be live at both `https://domain.com` and `https://app.domain.com`!
