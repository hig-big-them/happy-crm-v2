"use client";

import { useState } from "react";
import { useAuth } from "../../components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loader2, User, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";

export default function ProfilePage() {
  const { user, userRole, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t, locale } = useI18n();

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t.profile.notLogged}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superuser":
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "agency":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>{t.profile.title}</CardTitle>
          </div>
          <CardDescription>
            {t.profile.desc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t.profile.email}
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t.profile.role}
            </Label>
            <div>
              <Badge variant={getRoleBadgeVariant(userRole || "user")}>
                {userRole || "user"}
              </Badge>
            </div>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label>{t.profile.userId}</Label>
            <Input
              value={user.id}
              disabled
              className="bg-muted font-mono text-xs"
            />
          </div>

          {/* Account Created */}
          <div className="space-y-2">
            <Label>{t.profile.createdAt}</Label>
            <Input
              value={new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href="/account/settings">{t.profile.accountSettings}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/update-password">{t.profile.changePassword}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}