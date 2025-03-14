import { getEmbeddings } from "./embeddings";
import { getMatchesFromEmbeddings } from "./pinecone";

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  
  const matches = await getMatchesFromEmbeddings(queryEmbeddings);

  const relevantMatches = matches
    .filter(match => match.metadata?.fileKey === fileKey)
    .map(match => match.metadata?.text || '')
    .join('\n\n');

  return relevantMatches;
}