import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function convertToJpeg(uri: string): Promise<string> {
  let compress = 0.9;
  let width = 1200;
  let currentUri = uri;

  while (true) {
    // Compress & resize
    const result = await manipulateAsync(
      currentUri,
      [{ resize: { width } }],
      {
        compress,
        format: SaveFormat.JPEG,
      }
    );

    currentUri = result.uri;

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(currentUri);
    const size = fileInfo.size ?? 0;

    if (size <= MAX_FILE_SIZE || compress <= 0.3) {
      return currentUri;
    }

    // Decrease quality/width and try again
    compress = Math.max(0.3, compress - 0.1);
    width = Math.floor(width * 0.9);
  }
}
