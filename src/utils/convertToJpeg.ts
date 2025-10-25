import * as ImageManipulator from "expo-image-manipulator";

export async function convertToJpeg(uri: string): Promise<string> {
  // Create a manipulation context by calling .manipulate()
  const context =  ImageManipulator.ImageManipulator.manipulate(uri);

  // Apply actions (e.g., resize, rotate) on the context
  context.flip("horizontal");
  context.resize({ width: 800 });

  // Render the manipulations
  const rendered = await context.renderAsync();

  // Save the image with options (compress, format)
  const result = await rendered.saveAsync({
    compress: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: false
  });

  return result.uri;
}
