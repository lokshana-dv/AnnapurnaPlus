import { createContext, useContext, useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../api/firebase'
import { registerUser, getUserByFirebaseUid } from '../api/endpoints'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, name, role) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    try { await sendEmailVerification(result.user) } catch(e) {}
    try {
      const response = await registerUser({ firebaseUid: result.user.uid, name, email, role })
      setDbUser(response.data)
    } catch(e) { console.warn('Backend registration failed:', e.message) }
    return result
  }

  async function login(email, password) { return signInWithEmailAndPassword(auth, email, password) }
  async function logout() { await signOut(auth); setDbUser(null) }
  async function resetPassword(email) { return sendPasswordResetEmail(auth, email) }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try { const res = await getUserByFirebaseUid(user.uid); setDbUser(res.data) }
        catch (e) { console.warn('Could not fetch user from backend:', e.message) }
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={{ currentUser, dbUser, signup, login, logout, resetPassword }}>{!loading && children}</AuthContext.Provider>
}