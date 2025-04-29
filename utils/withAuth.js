// utils/withAuth.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import cookie from 'js-cookie'

export default function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter()
    useEffect(() => {
      if (!cookie.get('token')) {
        router.replace('/login')
      }
    }, [router])

    return <WrappedComponent {...props} />
  }
}
