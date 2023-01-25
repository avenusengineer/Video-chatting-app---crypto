import { useEffect, useState } from "react"

export async function getDeviceInfo(): Promise<DeviceInfo> {
  await navigator?.mediaDevices?.getUserMedia({ audio: true, video: false })
  const devices = (await navigator?.mediaDevices?.enumerateDevices()) || []

  return {
    audioInputDevices: devices.filter((device) => device.kind === "audioinput"),
    videoInputDevices: devices.filter((device) => device.kind === "videoinput"),
    audioOutputDevices: devices.filter((device) => device.kind === "audiooutput"),
    hasAudioInputDevices: devices.some((device) => device.kind === "audioinput"),
    hasVideoInputDevices: devices.some((device) => device.kind === "videoinput"),
  }
}

interface DeviceInfo {
  audioInputDevices: MediaDeviceInfo[]
  videoInputDevices: MediaDeviceInfo[]
  audioOutputDevices: MediaDeviceInfo[]
  hasAudioInputDevices: boolean
  hasVideoInputDevices: boolean
}

type DeviceInfoState = DeviceInfo & {
  isEnumeratingDevices: boolean
}

const defaultState: DeviceInfoState = {
  videoInputDevices: [],
  audioOutputDevices: [],
  audioInputDevices: [],
  hasVideoInputDevices: false,
  hasAudioInputDevices: false,
  isEnumeratingDevices: true,
}

const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoState>(defaultState)

  useEffect(() => {
    getDeviceInfo().then((newDeviceInfo) => {
      setDeviceInfo({
        ...newDeviceInfo,
        isEnumeratingDevices: false,
      })
    })
  }, [])

  useEffect(() => {
    const handleDeviceChange = () => {
      getDeviceInfo().then((newDeviceInfo) => {
        setDeviceInfo({
          ...newDeviceInfo,
          isEnumeratingDevices: false,
        })
      })
    }

    navigator?.mediaDevices?.addEventListener("devicechange", handleDeviceChange)

    return () => {
      navigator?.mediaDevices?.removeEventListener("devicechange", handleDeviceChange)
    }
  }, [])

  return deviceInfo
}

export default useDeviceInfo
