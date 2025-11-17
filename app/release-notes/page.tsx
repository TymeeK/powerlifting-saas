import { readFile } from 'fs/promises';
import { join } from 'path';
import { ReleaseNotesContent } from './release-notes-content';

async function getReleaseNotes() {
  const filePath = join(
    process.cwd(),
    'app',
    'release-notes',
    'release-notes.md'
  );
  const fileContents = await readFile(filePath, 'utf8');
  return fileContents;
}

export default async function ReleaseNotesPage() {
  const markdown = await getReleaseNotes();

  return <ReleaseNotesContent markdown={markdown} />;
}
