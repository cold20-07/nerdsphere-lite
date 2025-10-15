# NerdSphere

An experimental anonymous global chat room. No moderation. Expect chaos. Messages disappear after 24 hours.

## Tech Stack

- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** with custom space theme
- **Supabase** for database and real-time subscriptions
- **Vercel** for deployment

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase project URL and anon key

4. Set up the database:
   - Follow the instructions in `supabase/README.md` to create the database schema
   - Enable Realtime for the `messages` table in your Supabase dashboard

5. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings.

## Project Structure

```
nerdsphere/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page
│   └── globals.css      # Global styles
├── components/          # React components (to be created)
├── lib/                 # Utility functions (to be created)
├── supabase/            # Database migrations and setup
│   ├── migrations/      # SQL migration files
│   └── README.md        # Database setup instructions
├── .env.local          # Environment variables (not in git)
└── tailwind.config.ts  # Tailwind configuration with space theme
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Theme

The application uses a custom space theme with:
- Dark gradient backgrounds (deep space colors)
- Purple and cyan accent colors
- Glow effects on interactive elements
- Smooth animations and transitions

## License

ISC
