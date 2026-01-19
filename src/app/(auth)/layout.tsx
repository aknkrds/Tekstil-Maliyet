export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const imageSrc = '/login-images/login.jpg';

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative flex-1">
        <img
          src={imageSrc}
          alt="Giriş görseli"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex w-full max-w-md items-center justify-center bg-white shadow-2xl">
        <div className="w-full px-8 py-12 space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
