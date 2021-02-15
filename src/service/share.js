import * as conversationService from '@/service/conversations'
import * as messageService from '@/service/messages'
import Constant from '@/store/constant'

export const sendSrMessage = async (conversationId, userId, parentId, content) => {
  const messageResponce = await messageService.createMessage({
    ownerId: 'admin',
    opponentId: parentId,
    conversationId,
    ownerType: 'SMARTRADOR',
    opponentType: 'PARENT',
    content,
    createdAt: new Date()
  })

  await conversationService.updateConversation({
    id: conversationId,
    userId,
    lastMessageId: messageResponce.id,
    updatedAt: new Date()
  })

  await conversationService.updateConversation({
    id: conversationId,
    userId: parentId,
    lastMessageId: messageResponce.id,
    updatedAt: new Date()
  })

  return messageResponce.id
}

export const setReportable = (requests) => {
  if (!requests) return {}

  const request = Object.entries(requests).sort(function (a, b) {
    if (a[1].createDate > b[1].createDate) return -1
    if (a[1].createDate < b[1].createDate) return 1
    return 0
  })

  if (!request[0][1].reportDate) return {}

  const reportableDate = new Date(request[0][1].reportDate)
  reportableDate.setDate(reportableDate.getDate() - Constant.REPORTABLE_DATE)
  reportableDate.setHours(0)
  reportableDate.setMinutes(0)

  return {
    requestId: request[0][0],
    isReportable: reportableDate < new Date(),
    startDate: `${reportableDate.getMonth() + 1}/${reportableDate.getDate()}`,
    endDate: `${new Date(request[0][1].reportDate).getMonth() + 1}/${new Date(request[0][1].reportDate).getDate()}`
  }
}

export const avatar = (teacherId, photoId) => {
  return `${process.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
}
