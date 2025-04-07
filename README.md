# LAN Chat Application

A real-time chat application that works across devices on your Local Area Network (LAN). Built with Next.js, Socket.IO, and Prisma.

## Features

- **Real-time messaging** across devices on the same network
- **Room-based chat system** - create or join different chat rooms
- **User presence** - see who's online in your room
- **Automatic LAN discovery** - connects devices on the same network
- **Persistent chat history** - messages are stored in a database
- **Modern, responsive UI** - works on desktop and mobile devices

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Getting Started

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Accessing the Application

The server will display available network addresses when started:

```
> Ready on http://localhost:3000
> Network access available at:
  - http://192.168.1.5:3000 (en0)
  - http://10.0.0.5:3000 (en1)
```

You can access the application in two ways:

1. **Local access**: Open [http://localhost:3000](http://localhost:3000) in your browser
2. **LAN access**: Other devices on the same network can access the application using one of the network addresses shown (e.g., http://192.168.1.5:3000)

## Usage

1. **Enter a nickname** - This will be your display name in the chat
2. **Join an existing room** or **Create a new room**
3. **Start chatting** with other users on your network

## Network Configuration

- The application runs on port 3000 by default
- Make sure your firewall allows connections on port 3000
- All devices must be on the same local network to communicate

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
