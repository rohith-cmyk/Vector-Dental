# Vector Referral Frontend

Modern Next.js 14 frontend application for Vector Referral.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Zustand** for state management
- **React Hook Form** for forms
- **Recharts** for data visualization

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update API URL if needed

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
src/
├── app/              # Next.js app directory (routes & layouts)
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components
│   ├── layout/      # Layout components (Sidebar, Header)
│   └── dashboard/   # Dashboard-specific components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── types/            # TypeScript types
├── styles/           # Global styles
└── constants/        # App constants
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Design System

Based on the reference design with:
- Dark sidebar (#1e293b)
- Green brand color (#84cc16)
- Clean, modern card-based UI
- Responsive layout

