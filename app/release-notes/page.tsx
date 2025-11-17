import { readFile } from 'fs/promises';
import { join } from 'path';
import { ReleaseNotesContent } from './release-notes-content';

async function getReleaseNotes() {
  const versions = ['1.0.1', '1.0.0'];
  const notes: Record<string, string> = {};

  for (const version of versions) {
    const filePath = join(
      process.cwd(),
      'app',
      'release-notes',
      `v${version}.md`
    );
    const fileContents = await readFile(filePath, 'utf8');
    notes[version] = fileContents;
  }

  return notes;
}

export default async function ReleaseNotesPage() {
  const releaseNotes = await getReleaseNotes();

  return <ReleaseNotesContent releaseNotes={releaseNotes} />;
}
