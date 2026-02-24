import api from '../api/client'

export const PostService = {
  list: (params) => api.get('/posts', { params }),
  myFeed: (params) => api.get('/posts/me-feed', { params }),
  feed: (params, authed) => (!!authed ? PostService.myFeed(params) : PostService.list(params)),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
  uploadImage: (id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/posts/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),

  comments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  deleteComment: (commentId) => api.delete(`/posts/comments/${commentId}`),
}
