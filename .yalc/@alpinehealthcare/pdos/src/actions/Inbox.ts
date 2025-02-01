import pdos from "../Core"

export const clearMessages = async () => {
  await pdos().stores.userAccount.edges.e_out_Inbox.clearMessages()
}

export const getMessages = async () => {
  return pdos().stores.userAccount.edges.e_out_Inbox._rawNode.unread_messages
}