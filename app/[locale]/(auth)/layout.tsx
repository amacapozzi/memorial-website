import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen font-sans lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="text-primary relative hidden h-full flex-col bg-background p-10 lg:flex border-r border-border">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Memorial
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2 leading-normal text-balance text-sm">
            <p>
              &ldquo;Memorial transformed how I manage my day. Voice reminders
              via WhatsApp, synced automatically to my calendar. I never miss a
              thing.&rdquo;
            </p>
            <footer className="text-primary/60 text-xs mt-2">
              — Sofia Davis
            </footer>
          </blockquote>
        </div>
        <div className="relative z-20 mt-8 flex items-center gap-6 text-xs text-primary/40">
          <span>&copy; 2025 Memorial</span>
          <Link href="/privacy" className="hover:text-primary/70 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary/70 transition-colors">
            Terms
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  );
}
