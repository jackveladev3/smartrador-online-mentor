import gql from 'graphql-tag'

export default gql`
  query SendMail($type: String!, $teacherId: String!, $parentId: String!, $message: String!, $conversationId: String!){
    sendMail (
      type: $type,
      teacherId: $teacherId,
      parentId: $parentId,
      message: $message,
      conversationId: $conversationId
    )
  }
`
