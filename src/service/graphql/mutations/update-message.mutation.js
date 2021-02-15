import gql from 'graphql-tag'

export default gql`
mutation UpdateMessage($input: MessageUpdateInput!) {
  updateMessage(
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
    readedAt
  }
}`
