import React from 'react';
import { useRouter } from 'next/navigation';
const Editor = () => {
  const router = useRouter();

  return (
    <div>
      <div className=' border border-black px-3 py-3 w-fit m-5' onClick={()=>{ router.push("/editor/0")}}>
        Editor
      </div>
    </div>
  );
};

export default Editor;