import { mapFrequencyToRange, noteFromFrequency } from "./utils.mjs";

export class GlobalTuneMapper {
  map(voice, options = {}) {
    if (!voice?.detected || !Number.isFinite(voice.fundamentalHz)) return null;
    if (Number.isFinite(voice.pitchVariabilityCents) && voice.pitchVariabilityCents > (options.maxPitchVariabilityCents || 280)) return null;
    const mappedHz = mapFrequencyToRange(voice.fundamentalHz, options.minHz || 36, options.maxHz || 70);
    const note = noteFromFrequency(voice.fundamentalHz);
    return {
      sourceHz: voice.fundamentalHz,
      mappedHz,
      pitchClass: note?.pitchClass,
      centsOffset: note?.centsOffset
    };
  }
}
