import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBjezdemT3WfVP8EOWdf7gQ-pPOHXEUrFk",
  authDomain: "annapurna-plus.firebaseapp.com",
  projectId: "annapurna-plus",
  storageBucket: "annapurna-plus.firebasestorage.app",
  messagingSenderId: "1016442376632",
  appId: "1:1016442376632:web:d8854e15899815df9d7f4d"
}

const app = initializeApp(firebaseConfig)
export const auth    = getAuth(app)
export const storage = getStorage(app)
export default app