import { createSupabaseServer } from '@/utils/supabase/server'

type FarcasterUser = {
  pfp: string
  displayName: string
  bio: string
}

const DEFAULT_FARCASTER_USER = {
  pfp: '',
  displayName: '',
  bio: '',
}

async function getFarcasterUser(fid: number): Promise<FarcasterUser> {
  const res = await fetch(
    `https://hub.pinata.cloud/v1/userDataByFid?fid=${fid}`,
    {
      method: 'GET',
    }
  )

  if (!res.ok) {
    return DEFAULT_FARCASTER_USER
  }

  const data = await res.json()

  if (data.messages.length === 0) {
    return DEFAULT_FARCASTER_USER
  }

  const user = data.messages.reduce(
    (
      acc: FarcasterUser,
      message: { data: { userDataBody: { type: string; value: string } } }
    ) => {
      if (message.data.userDataBody.type === 'USER_DATA_TYPE_PFP') {
        acc.pfp = message.data.userDataBody.value
      }

      if (message.data.userDataBody.type === 'USER_DATA_TYPE_DISPLAY') {
        acc.displayName = message.data.userDataBody.value
      }

      if (message.data.userDataBody.type === 'USER_DATA_TYPE_BIO') {
        acc.bio = message.data.userDataBody.value
      }

      return acc
    },
    DEFAULT_FARCASTER_USER
  )

  return user
}

async function getFarcasterIdByUsername(username: string) {
  const res = await fetch(
    `https://hub.pinata.cloud/v1/userNameProofByName?name=${username}`,
    {
      method: 'GET',
    }
  )

  if (!res.ok) {
    return 0
  }

  const data = await res.json()

  return data.fid
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const { id } = params

  const supabase = createSupabaseServer()

  let fid = id

  // Test to see if `id` is potentially a username
  const isNumbersOnly = new RegExp('^[0-9]+$')
  if (!isNumbersOnly.test(id)) {
    fid = await getFarcasterIdByUsername(id)
  }

  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('fid', fid)
    .limit(1)
    .maybeSingle()

  const farcasterUser = await getFarcasterUser(Number(fid))

  if (!farcasterUser.pfp) {
    return <div className="max-w-3xl mx-auto py-8 px-6">User Not Found</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <img
        className="w-24 h-24 rounded-full object-cover"
        src={farcasterUser.pfp}
        alt={farcasterUser.displayName}
      />
      <p className="mt-4">{farcasterUser.displayName}</p>
      <p>{farcasterUser.bio}</p>
      {!linksData && <p className="mt-4">😭 No Links Found</p>}
      {linksData && (
        <p className="mt-4">
          Website:{' '}
          <a className="underline hover:no-underline" href={linksData.website}>
            {linksData.website}
          </a>
        </p>
      )}
    </div>
  )
}