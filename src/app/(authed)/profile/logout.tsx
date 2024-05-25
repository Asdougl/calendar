'use client'

import { signOut } from 'next-auth/react'
import { Button } from '~/components/ui/button'

export const LogoutButton = () => (
  <div className="flex items-center justify-center py-12">
    <Button onClick={() => signOut()} intent="secondary" className="w-40">
      Logout
    </Button>
  </div>
)
