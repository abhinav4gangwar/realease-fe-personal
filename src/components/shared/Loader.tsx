import Image from 'next/image'

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className='animate-bounce'>
        <Image src="/assets/logo.png" alt="logo" height={250} width={250} />
      </div>
    </div>
  )
}

export default Loader
