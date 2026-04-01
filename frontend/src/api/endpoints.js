import api from './axiosInstance'

export const registerUser = (data) => api.post('/users/register', data)
export const getUserById = (id) => api.get(`/users/${id}`)
export const getUserByFirebaseUid = (uid) => api.get(`/users/firebase/${uid}`)
export const updateProfile = (id, data) => api.put(`/users/${id}`, data)
export const getAllUsers = () => api.get('/users')
export const getUsersByRole = (role) => api.get(`/users/role/${role}`)
export const getLeaderboard = () => api.get('/users/leaderboard')
export const awardBadge = (id) => api.post(`/users/${id}/badge`)

export const createDonation = (donorId, data) => api.post(`/donations/donor/${donorId}`, data)
export const getAllDonations = () => api.get('/donations')
export const getAvailableDonations = () => api.get('/donations/available')
export const getDonationsByDonor = (donorId) => api.get(`/donations/donor/${donorId}`)
export const updateDonationStatus = (id, status) => api.patch(`/donations/${id}/status?status=${status}`)
export const deleteDonation = (id) => api.delete(`/donations/${id}`)

export const createRequest = (userId, data) => api.post(`/requests/user/${userId}`, data)
export const getAllRequests = () => api.get('/requests')
export const getRequestsByUser = (userId) => api.get(`/requests/user/${userId}`)
export const getMatchedDonations = (reqId) => api.get(`/requests/${reqId}/matches`)
export const updateRequestStatus = (id, status) => api.patch(`/requests/${id}/status?status=${status}`)

export const acceptDelivery = (data) => api.post('/deliveries/accept', data)
export const updateDeliveryStatus = (id, status) => api.patch(`/deliveries/${id}/status?status=${status}`)
export const getVolunteerDeliveries = (vid) => api.get(`/deliveries/volunteer/${vid}`)
export const getAllDeliveries = () => api.get('/deliveries')

export const getNotifications = (userId) => api.get(`/notifications/user/${userId}`)
export const getUnreadCount = (userId) => api.get(`/notifications/user/${userId}/unread-count`)
export const markAllRead = (userId) => api.patch(`/notifications/user/${userId}/read-all`)

export const submitFeedback = (data) => api.post('/feedback', data)
export const getFeedbackByDelivery = (id) => api.get(`/feedback/delivery/${id}`)
export const getVolunteerRating = (vid) => api.get(`/feedback/volunteer/${vid}/rating`)

export const getAdminStats = () => api.get('/admin/stats')

export const deleteUser = (id) => api.delete(`/users/${id}`)
export const deleteRequest = (id) => api.delete(`/requests/${id}`)