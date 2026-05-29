import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'lucide-react'

function EmptyWorkspace() {
  return (
    <div className='flex flex-col mt-10 justify-center items-center'>
      <Image src={'/folder.png'} alt='folder' width={70} height={70} />
      <h2 className='text-2xl font-medium mt-5'>No Repository Connected</h2>
      <p className='font-sm text-center mt-3'>Connect your Github account and add a repository to generate and run test cases</p>

      <Button className='mt-5 cursor-pointer'> <Link className='h-4 w-4 mr-2' /> Connect Repo </Button>
    </div>
  )
}

export default EmptyWorkspace
