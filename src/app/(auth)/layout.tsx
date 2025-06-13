import Image from 'next/image'

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Tagline */}
          <div className="space-y-2 text-center">
            <Image
              src="/assets/logo.png"
              alt="Realease Logo"
              width={190}
              height={40}
              className='mx-auto'
              priority
            />
            <p className="text-secondary font-bold lg:text-xl text-lg pt-2">Bring your assets into focus.</p>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/assets/auth-img.png"
          alt="City skyline at sunset"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}

export default AuthLayout
