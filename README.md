# InfoDepGroup2
Group 2 project


## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🚀 [Deploy](#deploy)
6. 📚 [Reference](#reference)
7. 🖊️ [Reflection](#reflection)

## <a name="introduction">🤖 Introduction</a>

### Our Idea

![flow](/public/images/flow.png)

### Twelve Labs' Advantages ([ref](https://docs.twelvelabs.io/docs/introduction))

![advantages](https://twelvelabs-docs-assets.s3.us-west-2.amazonaws.com/v1.2/img/png/our-multimodal-approach.png)

### Twelve Labs' Architecture Overview ([ref](https://docs.twelvelabs.io/docs/platform-overview))

![architecture overview](https://twelvelabs-docs-assets.s3.us-west-2.amazonaws.com/v1.2/img/png/architecture-overview.png)

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- TypeScript
- Tailwind CSS
- ShadCN/UI
- Ant Design
- Convex
- Clerk
- Twelve Labs
- Disqus

## <a name="features">🔋 Features</a>

👉 **Robust Authentication**: Secure and reliable user login and registration system with Convex and Clerk.

👉 **Video with AI**: Use Twelve Labs two models: Marengo2.6 and Pegasus1.1 to generate videos' hastags, summary, highlights, and chapters and classify with predefined classes and store these data into Convex automatically with Twelve Labs Webhook. User can watch not only the main video but also its highlights, chapters instantly.

👉 **Smartly Videos Recommendation**: Use Twelve Labs API "search" to search videos with hashtags to recommend similar videos.

👉 **Comment Section**: Integrate Disqus into the web app that store comment in Disqus db.

👉 **Discover Page**: Dedicated page for users to explore videos.

👉 **Responsive Design**: Fully functional and visually appealing across all devices and screen sizes.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**
Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (node version higher than v20._._)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### 1. Cloning the Repository

```bash
git clone https://github.com/ChenBingWei1201/genai-stars.git
cd genai-stars
```

### 2. Install the project dependencies

```bash
# genai-stars
npm i
```

### 2. Set Up Environment Variables

```bash
# genai-stars
cp .env.development .env.local
```

in .env.local

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Twelve Labs
TWELVE_LABS_API_KEY=
TWELVE_LABS_WEBHOOK_SECRET=
NEXT_PUBLIC_INDEX_ID=
```

Replace the placeholder values with your actual Convex & Clerk credentials and Twelve Labs API key. You can obtain these credentials by signing up on the [Convex](https://www.convex.dev/), [Clerk](https://clerk.com/), and [Twelve Labs](https://www.twelvelabs.io/) websites.
**Remeber to paste clerk and twelve labs enviroment variables on convex project setting page**

### 3. Running the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## <a name="deploy">🚀 Deploy </a>

Deploy on Vercel:
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## <a name="reference">📚 Reference</a>

1. [Twelve Labs API docs](https://docs.twelvelabs.io/reference/api-reference)
2. [Convex docs](https://docs.convex.dev/quickstart/nextjs)
3. [Clerk docs](https://clerk.com/docs/quickstarts/nextjs)
4. [Disqus](https://disqus.com/)
5. [podcastr](https://youtu.be/zfAb95tJvZQ?feature=shared)
6. [who-talk-about-us](https://github.com/mrnkim/Who-Talked-About-Us)
7. [summarize-youtube-video](https://github.com/mrnkim/summarize-youtube-video)
8. [file-drive](https://github.com/webdevcody/file-drive)

## <a name="reflection">🖊️ Reflection</a>

name:
studentID:
reflection:

name:
studentID:
reflection:

name:
studentID:
reflection:
