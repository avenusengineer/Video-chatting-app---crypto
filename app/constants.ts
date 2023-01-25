export const DEFAULT_VIDEO_CONSTRAINTS: MediaStreamConstraints["video"] = {
  width: 1920,
  height: 1080,
  frameRate: 30,
}

// These are used to store the selected media devices in localStorage
export const SELECTED_AUDIO_INPUT_KEY = "Seconds-selectedAudioInput"
export const SELECTED_AUDIO_OUTPUT_KEY = "Seconds-selectedAudioOutput"
export const SELECTED_VIDEO_INPUT_KEY = "Seconds-selectedVideoInput"
