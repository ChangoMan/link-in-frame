'use client'

import { usePrivy } from '@privy-io/react-auth'

export default function RefreshPage() {
  const { ready, authenticated, login } = usePrivy()
  const disableLogin = !ready || (ready && authenticated)

  if (ready && !authenticated) {
    return (
      <button disabled={disableLogin} onClick={login}>
        Log in
      </button>
    )
  }

  if (ready && authenticated) {
    return <main className="max-w-7xl mx-auto px-6 py-8">AUTHENTOCATED</main>
  }

  return <div>Loading...</div>
}
