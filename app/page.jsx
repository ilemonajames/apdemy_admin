'use client'
import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { userDetailContext } from '@/context/UserDetailContext';

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);
  const {userDetail, setUserDetail} = useContext(userDetailContext);

  // Only set user details without redirecting
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if (user) {
        console.log('User found:', user);
        const result = await getDoc(doc(db, 'users', user?.uid));
        setUserDetail(result.data());
      } else {
        setUserDetail(null);
      }
      setInitialAuthCheck(false);
    });

    return () => unsubscribe();
  }, [setUserDetail]);

  const showToast = (message) => {
    alert(message); // Replace with toast library
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const resp = await signInWithEmailAndPassword(auth, email, password);
      console.log(`${resp.user.email} signed in`);
      
      // Get user details after successful login
      const result = await getDoc(doc(db, 'users', resp.user.uid));
      setUserDetail(result.data());
      
      // Only redirect after successful login
      router.push('/home');
    } catch (error) {
      showToast('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading only during initial auth check
  if (initialAuthCheck) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 ">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 shadow-lg border border-blue-100 rounded-4xl"
      >
        {/* Logo */}
        <img src="/logo-dark.png" alt="Logo" className="w-28 h-28 mx-auto mb-4 rounded-2xl" />

        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">Welcome Back</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4 text-gray-800 bg-blue-50/30"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-6 text-gray-800 bg-blue-50/30"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition duration-200 ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}