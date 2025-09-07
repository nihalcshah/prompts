# Next.js 14 + Supabase Starter

A modern, full-stack web application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. Features server-side authentication, beautiful animated gradient backgrounds, and a responsive design.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Backend**: [Supabase](https://supabase.com) (Database, Auth, Storage)
- **Authentication**: Supabase Auth with SSR support
- **Deployment**: Ready for [Vercel](https://vercel.com)

## ✨ Features

- 🔐 **Server-side Authentication** with Supabase
- 🎨 **Animated Gradient Background** using Tailwind CSS
- 📱 **Responsive Design** with mobile-first approach
- 🌙 **Dark Mode Support** with system preference detection
- ⚡ **Server Components** for optimal performance
- 🔒 **Type Safety** with TypeScript throughout
- 🎯 **SEO Optimized** with proper meta tags

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with animated background
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Home page component
├── utils/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       └── server.ts        # Server Supabase client
└── middleware.ts            # Auth middleware for protected routes
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd <your-project>
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to see your app!

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to find your project URL and anon key
3. Update your `.env.local` file with these credentials
4. Set up your database schema and authentication policies as needed

## 🎨 Customization

### Animated Background

The animated gradient background is configured in `src/app/globals.css`. You can customize:

- **Colors**: Update CSS custom properties in `:root` and `@media (prefers-color-scheme: dark)`
- **Animation**: Modify the `@keyframes gradient-xy` animation
- **Speed**: Change the animation duration (currently 15s)

### Tailwind Configuration

Custom animations and utilities are defined in `tailwind.config.ts`:

- **Gradient animations**: `animate-gradient-x`, `animate-gradient-y`, `animate-gradient-xy`
- **Custom colors**: Extend the color palette as needed
- **Responsive breakpoints**: Modify or add new breakpoints

## 🔐 Authentication

This starter includes:

- **Server-side auth** with automatic token refresh
- **Protected routes** via middleware
- **Client and server** Supabase clients
- **Type-safe** user sessions

Example usage:

```typescript
// In a Server Component
import { createClient } from '@/utils/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return <div>Hello {user.email}!</div>
}
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

This app can be deployed to any platform that supports Next.js:

- **Netlify**: Use the `@netlify/plugin-nextjs` plugin
- **Railway**: Connect your GitHub repository
- **DigitalOcean**: Use App Platform with Node.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) team for the amazing framework
- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
- [Vercel](https://vercel.com) for seamless deployment
