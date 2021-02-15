module.exports = {
  TABS: [
    { value: 1, text: 'おすすめ', type: 'recommend' },
    { value: 2, text: '新着', type: 'new' },
    { value: 3, text: '英語', type: 'eng', subject: 1 },
    { value: 4, text: '算数', type: 'math', subject: 2 },
    { value: 5, text: '中学数学', type: 'j-math', subject: 3 },
    { value: 6, text: '高校数学', type: 'h-math', subject: 4 },
    { value: 7, text: '理科', type: 'sci', subject: 5 },
    { value: 8, text: '物理', type: 'phy', subject: 6 },
    { value: 9, text: '化学', type: 'che', subject: 7 },
    { value: 10, text: '生物', type: 'bio', subject: 8 },
    { value: 11, text: '地学', type: 'geo', subject: 9 },
    { value: 12, text: '国語', type: 'jap', subject: 10 },
    { value: 13, text: '古典', type: 'old', subject: 11 },
    { value: 14, text: '社会', type: 'soc', subject: 12 },
    { value: 15, text: 'その他', type: 'otr', subject: 13 }
  ],
  SUBJECT: [
    { value: 1, text: '英語', bg: 'red darken-1', color: 'white' },
    { value: 2, text: '算数', bg: 'blue', color: 'white' },
    { value: 3, text: '中学数学', bg: 'blue darken-2', color: 'white' },
    { value: 4, text: '高校数学', bg: 'blue darken-4', color: 'white' },
    { value: 5, text: '理科', bg: 'green lighten-2', color: 'white' },
    { value: 6, text: '物理', bg: 'green darken-1', color: 'white' },
    { value: 7, text: '化学', bg: 'light-green darken-1', color: 'white' },
    { value: 8, text: '生物', bg: 'lime darken-1', color: 'white' },
    { value: 9, text: '地学', bg: 'teal darken-1', color: 'white' },
    { value: 10, text: '国語', bg: 'orange darken-1', color: 'white' },
    { value: 11, text: '古典', bg: 'deep-orange darken-1', color: 'white' },
    { value: 12, text: '社会', bg: 'brown darken-1', color: 'white' },
    { value: 13, text: 'その他', bg: 'grey darken-1', color: 'white' }
  ],
  OBJECTIVE: [
    { value: 1, text: '私の考えはどこがおかしいですか？' },
    { value: 2, text: '1つだけわからないところがあります' },
    { value: 3, text: 'ほとんど分かりません' }
  ],
  DETAIL_TEXT: {
    1: [
      'あなたが考えている内容や答えを教えてください',
      '不安な点や、確認したいことを書いてください'
    ],
    2: [
      'どこまで理解していますか？',
      '具体的にわからない部分を教えてください'
    ],
    3: [
      '質問の本文'
    ]
  },
  MENTOR_OBJECTIVE: [
    { value: 1, text: '受験を成功に導くメンターを探しています' },
    { value: 2, text: '学校の成績をあげるためのメンターを探しています' }
  ],
  MENTOR_SUPPORT: [
    { header: '選択肢にない場合は入力してください' },
    '学習計画の作成',
    'いまの学習計画の見直し',
    '学習管理・勉強の振り返り',
    '志望校の選定'
  ],
  MENTOR_CHAT: [
    { value: 1, text: '72時間以内' },
    { value: 2, text: '48時間以内', feature: 'メンター契約できたユーザーの80%が選択しています' },
    { value: 3, text: '24時間以内' }
  ],
  MENTOR_VIDEO: [
    { value: 1, text: '月に1回', feature: 'メンター契約できたユーザーの80%が選択しています' },
    { value: 2, text: '月に2回' },
    { value: 3, text: '月に4回' }
  ],
  REPORTABLE_DATE: 5,
  REVIEW_AXIS: [
    { value: 1, text: 'お願いしたいこと' },
    { value: 2, text: 'チャット' },
    { value: 3, text: 'ビデオチャット' }
  ],
  SKYWAY_JS: {
    API_KEY: '3ae70453-4877-4849-bae3-5848fea5ca04'
  }
}
