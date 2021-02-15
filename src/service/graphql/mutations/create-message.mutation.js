import gql from 'graphql-tag'

export default gql`
mutation CreateMessage($input: MessageCreateInput!) {
  createMessage(
    input: $input
  ) {
    id,
    conversationId,
    ownerId,
    ownerType,
    opponentType,
    opponentId,
    content,
    createdAt,
    readedAt,
    requestId
  }
}`
