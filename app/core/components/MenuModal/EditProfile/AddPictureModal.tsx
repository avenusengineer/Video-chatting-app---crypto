import { getAntiCSRFToken } from "@blitzjs/auth"
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"
import Cropper, { Area } from "react-easy-crop"
import { ZoomIn, ZoomOut } from "react-feather"

interface EditUserImageProps {
  image: File
  refetchUser: () => void
  onClose: () => void
  isOpen: boolean
}

const AddPictureModal = ({ image, onClose, isOpen, refetchUser }: EditUserImageProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 })
  const [crop, onCropChange] = useState({ x: 0, y: 0 })
  const [zoom, onZoomChange] = useState(1)
  const [area, setArea] = useState<Area>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const updatePicture = useCallback(async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        x: area.x.toString(10),
        y: area.y.toString(10),
        width: area.width.toString(10),
        height: area.height.toString(10),
        mediaWidth: mediaSize.width.toString(10),
        mediaHeight: mediaSize.height.toString(10),
      })

      const formData = new FormData()
      formData.append("file", image)

      const antiCSRFToken = getAntiCSRFToken()
      await fetch(`/api/user/image?${params.toString()}`, {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          "anti-csrf": antiCSRFToken,
        },
      })

      await refetchUser()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [area, image, mediaSize, onClose, refetchUser])

  const imageURL = useMemo(() => URL.createObjectURL(image), [image])

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size={["xs", "xl"]}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent maxH="90vh" borderRadius="lg" h={["sm", "xl"]} as={Flex} bgColor="#201727">
        <ModalHeader display="flex" flexDir="row" justifyContent="space-between">
          <Text>Update picture</Text>
          <Button
            onClick={updatePicture}
            colorScheme="purple"
            bgColor="#B026FF"
            isLoading={isLoading}
          >
            Save
          </Button>
        </ModalHeader>
        <ModalBody as={Flex} position="relative" w="100%">
          <Cropper
            style={{
              cropAreaStyle: {
                border: "2px solid #B026FF",
              },
              containerStyle: {
                backgroundColor: "#201727",
              },
            }}
            crop={crop}
            zoom={zoom}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            aspect={4 / 5}
            onCropComplete={(area) => setArea(area)}
            onMediaLoaded={(mediaSize) => {
              setMediaSize({ width: mediaSize.naturalWidth, height: mediaSize.naturalHeight })
            }}
            image={imageURL}
          />
        </ModalBody>
        <Flex flexDir="row" gridGap="1rem" py="1rem" px="1rem">
          <ZoomOut />
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(value) => onZoomChange(value)}
          >
            <SliderTrack bg="purple.100">
              <Box position="relative" right={10} />
              <SliderFilledTrack bg="#B026FF" />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
          <ZoomIn />
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default AddPictureModal
