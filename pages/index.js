// pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Link from 'next/link'
import cookie from 'js-cookie'

export default function Home() {
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!cookie.get('token')) {
      router.replace('/login')
    }
  }, [router])

  const { data, error, mutate } = useSWR(
    () => cookie.get('token') && '/api/me',
    (url) => fetch(url).then((res) => res.json())
  )

  if (!cookie.get('token')) return null   // wait for redirect
  if (error) return <p>Error loading user</p>
  if (!data)  return <p>Loading…</p>

  return (
    <div>
      {data.email ? (
        <>
          <h1>Welcome back, {data.email}!</h1>
          <button onClick={() => { cookie.remove('token'); mutate() }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <h1>Welcome to Aurora Login</h1>
          <div>
            <Link href="/login"><a>Login</a></Link> or{' '}
            <Link href="/signup"><a>Sign Up</a></Link>
          </div>
        </>
      )}
    </div>
  )
}
