# InsightPDF - AI-Powered PDF Chat Application

InsightPDF is a Next.js application that allows users to chat with their PDF documents using AI. Upload any PDF and start asking questions about its content.

## Features

- 📄 PDF file upload and processing
- 💬 Real-time chat interface
- 🔍 Semantic search within PDFs
- 👤 User authentication
- 📱 Responsive design
- 💾 Persistent chat history

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database
- AWS S3 bucket
- Pinecone account
- OpenAI API key
- Clerk account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
NEXT_PUBLIC_S3_BUCKET_NAME="your-bucket-name"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="your-pinecone-index-name"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd insightpdf
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npm run db:push
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── chat/             # Chat interface
│   └── page.tsx          # Home page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db/               # Database configuration
│   ├── pinecone.ts       # Pinecone setup
│   └── s3-server.ts      # AWS S3 configuration
```

## API Routes

- `POST /api/create-chat` - Create new chat session
- `POST /api/chat` - Handle chat messages
- `GET /api/get-context` - Get PDF context
- `POST /api/add-message` - Save chat messages

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DrizzleORM](https://orm.drizzle.team/)
- [Pinecone](https://www.pinecone.io/)
- [OpenAI](https://openai.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Clerk](https://clerk.dev/)

## Development

To run tests:

```bash
npm run test
```

To run linting:

```bash
npm run lint
```

## Production Deployment

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
