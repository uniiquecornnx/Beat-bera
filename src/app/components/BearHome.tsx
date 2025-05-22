import Image from 'next/image';

export default function BearHome() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-indigo-300 relative">
        
        <Image 
        src="/images/bg-room.png" 
        alt="Room Background" 
        layout="fill" 
        objectFit="cover" 
        priority 
    />
      </div>
    );
  }
  