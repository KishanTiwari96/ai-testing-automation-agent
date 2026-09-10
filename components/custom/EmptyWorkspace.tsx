import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

interface Props {
  onConnect?: () => void;
}

function EmptyWorkspace({ onConnect }: Props) {
  return (
    <div className='flex flex-col my-8 justify-center items-center text-center max-w-md mx-auto'>
      <div className='p-4 bg-blue-50/80 rounded-2xl border border-blue-100'>
        <Image src={'/folder.png'} alt='folder' width={64} height={64} />
      </div>
      <h2 className='text-xl font-bold text-slate-900 mt-4'>No Repository Connected Yet</h2>
      <p className='text-xs text-slate-500 mt-2 leading-relaxed'>
        Import your first GitHub repository using the panel above to begin automated AI test generation and cloud Playwright execution.
      </p>

      {onConnect && (
        <Button onClick={onConnect} className='mt-5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs'>
          <PlusCircle className='h-4 w-4' /> Connect GitHub Account
        </Button>
      )}
    </div>
  );
}

export default EmptyWorkspace;
