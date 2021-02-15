import gql from 'graphql-tag'

export default gql`
query AllConversations($userId: String!, $after: String, $first: Int) {
  allConversations(
    userId: $userId,
    after: $after,
    first: $first
  ) {
    items {
      id,
      userId,
      userType,
      user {
        id,
        initial,
        photoId,
        photoFlag,
        sex,
      },
      opponentId,
      opponentType,
      opponent {
        id,
        initial,
        photoId,
        photoFlag,
        sex,
        isBusiness,
        businessDescription
      },
      lastMessageId,
      updatedAt,
      unreads,
      title,
      lastMessage {
        id,
        createdAt,
        ownerId,
        ownerType,
        opponentType,
        opponentId,
        conversationId,
        readedAt,
        content
      }
    },
    nextToken
  }
}`
