import { useMutation } from "@blitzjs/rpc"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC, useState } from "react"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import ConfirmModal from "app/core/components/ConfirmModal"
import Form from "../../Form"
import LabeledTextField from "../../LabeledTextField"
import deleteAccount from "app/users/mutations/deleteAccount"

interface DeleteAccountModalProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
  onClose: () => void
}

const DeleteAccountModal: FC<DeleteAccountModalProps> = ({ user, onClose }) => {
  const [deleteAccountMutation] = useMutation(deleteAccount)
  const [isDisabled, setIsDisabled] = useState(true)

  return (
    <ConfirmModal
      danger
      isOpen
      disabled={isDisabled}
      onClose={onClose}
      title="Are you sure to delete your account?"
      cancelText="Cancel"
      confirmText="Yes, delete my account"
      onConfirm={async () => {
        await deleteAccountMutation()
      }}
    >
      <Flex flexDir="column" gridGap="2rem">
        <Flex flexDir="column">
          <Text>This action cannot be undone.</Text>
          <Text>
            You will loose <b>{user.gems}</b> gems.
          </Text>
          <Text>
            You will loose <b>{user.balance}</b> earnings.
          </Text>
        </Flex>
        <Flex flexDir="column" gridGap=".5rem">
          <Text>
            Enter <b>{user.username}</b> to confirm:
          </Text>
          <Form
            onChange={(event) => {
              setIsDisabled((event.nativeEvent?.target as any)?.value !== user.username)
            }}
            onSubmit={(values) => {
              if (values.username === user.username) {
                setIsDisabled(false)
              }
            }}
          >
            <LabeledTextField name="username" placeholder={user.username} />
          </Form>
        </Flex>
      </Flex>
    </ConfirmModal>
  )
}

interface PrivacySettingsProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const PrivacySettings: FC<PrivacySettingsProps> = ({ user }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  return (
    <>
      {showConfirmModal && (
        <DeleteAccountModal user={user} onClose={() => setShowConfirmModal(false)} />
      )}
      <Flex flexDir="column" pt="2rem">
        <Button variant="outline" color="#EB5545" onClick={() => setShowConfirmModal(true)}>
          Delete my account
        </Button>
      </Flex>
    </>
  )
}

export default PrivacySettings
