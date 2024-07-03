'use client'

import { createSupabaseBrowser } from '@/utils/supabase/browser'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { saveProfile } from '../actions'
import { SubmitButton } from './SubmitButton'

export function EditProfile() {
  const { ready, authenticated, user } = usePrivy()

  if (!ready || !authenticated || !user?.farcaster?.fid) {
    return null
  }

  // Looks in the database to find links associated with the Farcaster ID
  const supabase = createSupabaseBrowser()
  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('user_fid', user.farcaster.fid)
    .limit(1)
    .maybeSingle()

  const saveProfileWithFid = saveProfile.bind(null, user.farcaster.fid)

  return (
    <div>
      <h1 className="text-2xl lg:text-4xl font-semibold">Edit Profile</h1>
      <div className="mt-8">
        <form action={saveProfileWithFid}>
          <div className="my-4 flex flex-col gap-2 w-60">
            <label>Website:</label>
            <input
              name="website"
              type="text"
              defaultValue={linksData.website}
              className="px-2 py-1 text-gray-800"
            />
          </div>
          <div className="flex items-center gap-4 mt-8">
            <SubmitButton />
            <Link href={`/user/${user.farcaster.fid}`}>View Profile</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
