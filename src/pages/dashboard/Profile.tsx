import { useState } from "react";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Info, Loader2, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { displayName, handleError, initials } from "@/components/bank/format";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.profile.updateProfile);
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Enter a name to save.");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated.");
    } catch (e) {
      const { message } = handleError(e);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Your details</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-border/70 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                  {initials(displayName(user))}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate text-lg tracking-tight">
                  {displayName(user)}
                </CardTitle>
                <CardDescription className="truncate">
                  {user?.email ?? "Guest session"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="How should we address you?"
              />
            </div>
            <Button
              type="button"
              className="rounded-xl"
              onClick={handleSave}
              disabled={isSaving || !name.trim() || name === user?.name}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/70 shadow-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-base tracking-tight">
                Account information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm">
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {user?._creationTime
                    ? format(new Date(user._creationTime), "MMMM d, yyyy")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Sign-in method</span>
                <span className="font-medium">
                  {user?.isAnonymous ? "Guest session" : "Email magic link"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Account status</span>
                <span className="font-medium text-primary">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dashed border-border bg-card/60 shadow-none">
            <CardContent className="flex items-start gap-3 p-5">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Demo environment:</span>{" "}
                balances start with {`$2,450`} in play funds, and all transfers
                and bill payments settle instantly for testing.
              </p>
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
