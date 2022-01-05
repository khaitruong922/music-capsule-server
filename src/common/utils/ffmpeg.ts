import { execAsync } from './child_process';

export const getAudioLengthInSeconds = async (filePath: string) => {
  const { stdout } = await execAsync(
    `ffprobe -i ${filePath} -show_entries format=duration -v quiet -of csv="p=0"`,
  );
  return Number(stdout);
};

export const buildPitchAndTempoString = (
  semitoneShift: number,
  playbackSpeed: number,
): string => {
  const pitchDisplay = `${semitoneShift >= 0 ? '+' : '-'}${semitoneShift}`;

  // playbackSpeed changed only
  if (semitoneShift === 0 && playbackSpeed !== 1) return `(x${playbackSpeed})`;
  // Pitch changed only
  if (semitoneShift !== 0 && playbackSpeed === 1) return `(${pitchDisplay})`;
  // Both playbackSpeed and pitch changed
  if (semitoneShift !== 0 && playbackSpeed !== 1)
    return `(x${playbackSpeed}, ${pitchDisplay})`;
  return ``;
};
