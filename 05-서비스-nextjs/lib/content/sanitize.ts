import sanitizeHtml from 'sanitize-html'

/** Insight 본문 저장 시 서버 sanitize(FR-A03-03) + h1→h2 강등(FR-A03-02 — 페이지 제목이 h1을 갖는다).
 *  클라이언트가 뭘 보냈든 이 함수를 거치지 않은 값은 저장하지 않는다. */
export function sanitizeInsightBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'u', 's',
      'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption', 'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'data'],
    transformTags: {
      h1: 'h2',
    },
  })
}
