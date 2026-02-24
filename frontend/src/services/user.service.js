import api from '../api/client'

export const UserService = {
  get(id) {
    return api.get(`/users/${id}`)
  },
  posts(id) {
    return api.get(`/users/${id}/posts`)
  },
}
