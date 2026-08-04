import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { artifactPath } from './visual-capture';

export async function copyVisualArtifact(id: string, sourcePath: string, viewportName: string): Promise<string> {
  const destination = artifactPath(id, viewportName);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(sourcePath, destination);
  return destination;
}
