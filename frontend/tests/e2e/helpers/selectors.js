export const S = {
  app: {
    title: 'header a:has-text("MiniSocial")',
  },

  nav: {
    feed: 'a[href="/feed"]',
    login: 'a[href="/login"]',
    register: 'a[href="/register"]',
    myProfile: 'text=My Profile',
    logout: 'button:has-text("Logout")',
  },

  auth: {
    email: 'input[placeholder="Email"]',
    username: 'input[placeholder="Username"]',
    password: 'input[placeholder="Password"]',
    btnLogin: 'button:has-text("Login")',
    btnRegister: 'button:has-text("Register")',
  },

  feed: {
    composer: '[data-testid="create-post"]',
    postContent: '[data-testid="post-content"]',
    postSubmit: '[data-testid="post-submit"]',
    loadMore: 'button:has-text("Load more")',

    postCard: 'article',
    btnComments: 'button:has-text("Comments")',

    btnEditPost: 'button:has-text("Edit")',
    btnDeletePost: 'button:has-text("Delete")',
    btnSaveEdit: 'button:has-text("Save")',
    btnCancelEdit: 'button:has-text("Cancel")',
    editTextarea: 'textarea',

    commentInput: 'input[placeholder="Write a comment…"]',
    commentSend: 'button:has-text("Send")',
    btnDeleteComment: 'button:has-text("Delete")',
  },

  notFound: {
    title: 'text=Page not found',
    goFeed: 'a:has-text("Go to Feed")',
  },
}
