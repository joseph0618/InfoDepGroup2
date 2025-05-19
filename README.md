# InfoDepGroup2
This is a next.js project for InfoDep, modified from in-class example "07-Podcastr". 

The main feature of the website is to establish a movie forum where users can share their favorite movies and can rate and review them.

Feature details:
- User can sign up and log in to the website.
- User can create a new post by entering a title, a description, and a link to the movie.
- User can view his own post.
- User can comment on a post.
- User can rate and review a post.
- User can search for a movie by title.
- User can view a list of popular movies.
- User can view a list of trending posts.
- User can view a list of popular tags.
- User can view a list of recent comments.

## Getting Started

copy `.env.development` to `.env`

```bash
cp .env.development .env
```

connect to convex project, and generate`CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local` automatically

```bash
npx convex dev
```

go to clerk to create a new project and paste secret keys to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env.local`

go to `next.config.mjs` and add your convex deployment url
"{
        protocol: "https",
        hostname: "CONVEX-NAME.convex.cloud",
},"

go to `convex/auth.config.ts` and change the domain:"" to your clerk account domain

create a new webhook on clerk dashboard and paste the secret key to `CLERK_WEBHOOK_SECRET`

finally, run the development server on [http://localhost:3000](http://localhost:3000)

```bash
npm run dev
```

## Deploy on Vercel

The easiest way to deploy Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
