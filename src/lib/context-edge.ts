export async function getContextFromEdge(query: string, fileKey: string) {
  try {
    // Ensure we have a base URL
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL is not defined');
      return '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/get-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, fileKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get context');
    }

    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error('Error fetching context:', error);
    return ''; // Return empty context rather than throwing
  }
}
