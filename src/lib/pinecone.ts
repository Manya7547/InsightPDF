import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not defined');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "insightpdf";

// Initialize Pinecone client with just the API key
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

async function ensureIndexExists() {
  try {
    console.log('Checking for existing Pinecone indexes...');
    const indexList = await pinecone.listIndexes();
    console.log('Existing indexes:', indexList);
    
    // Check if our index exists in the list of indexes
    const indexExists = indexList.indexes?.some((index: any) => index.name === PINECONE_INDEX_NAME);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${PINECONE_INDEX_NAME}`);
      await pinecone.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });

      console.log('Waiting for index to be ready...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    } else {
      console.log(`Index ${PINECONE_INDEX_NAME} already exists`);
    }

    return true;
  } catch (error) {
    // If the error is due to the index already existing, we can continue
    if ((error as any).status === 409) {
      console.log(`Index ${PINECONE_INDEX_NAME} already exists`);
      return true;
    }
    console.error('Error ensuring index exists:', error);
    throw error;
  }
}

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // Ensure index exists before proceeding
    await ensureIndexExists();

    console.log('Starting S3 download...');
    const filePath = await downloadFromS3(fileKey);
    if (!filePath) {
      throw new Error("Could not download from S3");
    }
    console.log('S3 download complete:', filePath);

    console.log('Loading PDF...');
    const loader = new PDFLoader(filePath);
    const pages = await loader.load();
    console.log('PDF loaded, splitting documents...');
    const documents = await splitDocuments(pages);
    console.log(`Document split into ${documents.length} chunks`);

    console.log('Starting document embedding...');
    const vectors = await Promise.all(
      documents.map(async (doc, idx) => {
        try {
          const embedding = await embedDocument(doc);
          console.log(`Embedded document chunk ${idx + 1}/${documents.length}`);
          return {
            ...embedding,
            metadata: {
              ...embedding.metadata,
              fileKey,
            },
          };
        } catch (error) {
          console.error(`Error embedding document chunk ${idx + 1}:`, error);
          throw error;
        }
      })
    );

    const index = pinecone.index(PINECONE_INDEX_NAME);
    console.log('Uploading vectors to Pinecone...');
    
    // Upload vectors in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }
    
    console.log('Upload to Pinecone complete');
    return true;
  } catch (error) {
    console.error('Error in loadS3IntoPinecone:', error);
    throw error;
  }
}

async function splitDocuments(docs: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await splitter.splitDocuments(docs);
  return splits;
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.pageContent,
        pageNumber: doc.metadata.pageNumber,
      },
    };
  } catch (error) {
    console.error('Error in embedDocument:', error);
    throw error;
  }
}

export const getMatchesFromEmbeddings = async (embeddings: number[], topK: number = 5) => {
  const index = pinecone.index(PINECONE_INDEX_NAME);
  
  try {
    const queryResult = await index.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return [];
  }
};
