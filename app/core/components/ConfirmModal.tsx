import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC, ReactNode } from "react"

export interface ConfirmModalProps {
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
  title?: string
  isOpen: boolean
  disabled?: boolean
  confirmText?: string
  cancelText?: string
  children?: ReactNode
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  onClose,
  onConfirm,
  title,
  isOpen,
  disabled,
  danger,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent
      justifyItems="center"
      backgroundColor="black"
      background="linear-gradient(180deg, rgba(255, 255, 255, 0.05) 46.4%, rgba(10, 7, 12, 0.05) 200%)"
    >
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>{children}</ModalBody>
      <ModalFooter gridGap="1rem">
        <Button onClick={onClose} variant="outline">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} colorScheme={danger ? "red" : "purple"} disabled={disabled}>
          {confirmText}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default ConfirmModal
