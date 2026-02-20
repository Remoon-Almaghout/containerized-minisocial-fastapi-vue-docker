export const sel = {
  feedLink: () => ({ role: 'link', name: /^Feed$/ }),
  loginLink: () => ({ role: 'link', name: /^Login$/ }),
  registerLink: () => ({ role: 'link', name: /^Register$/ }),

  postTextarea: () => 'textarea[placeholder="What\'s on your mind?"]',
  postButton: () => ({ role: 'button', name: /^Post$/ }),

  commentInput: () => 'input[placeholder="Write a comment..."]',
  commentSend: () => ({ role: 'button', name: /^Send$/ }),
}
