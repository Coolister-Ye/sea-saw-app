/**
 * Download a file from an authenticated API endpoint.
 * Uses fetch with JWT Authorization header, converts response to Blob,
 * and triggers a browser download.
 */
export async function downloadFileWithAuth(
  url: string,
  filename: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
