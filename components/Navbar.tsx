// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">Habits Addis</div>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:inline">
              {session.user.name || session.user.email}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                  <AvatarFallback>
                    {(session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button variant="outline" asChild>
            <a href="/auth/signin">Sign in</a>
          </Button>
        )}
      </div>
    </header>
  );
}