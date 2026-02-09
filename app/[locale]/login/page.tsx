'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/contexts/auth-context';
import { LogIn } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();

  // Navigation is handled in onSubmit after login completes
  // No useEffect needed - prevents race condition

  if (user) return null;

  const onSubmit = async (data: LoginFormValues) => {
    // 1. Normalize
    const email = data.email.trim().toLowerCase();
    const password = data.password; // Do NOT trim password

    // 2. Debug Logging (DEV ONLY)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login Attempt]', {
        emailLength: email.length,
        emailHasSpace: email.includes(' '),
        passwordLength: password.length,
        keys: Object.keys(data)
      });
    }

    if (!email || !password) {
      toast.error(t('auth.invalidCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      // 3. Send normalized data
      await login(email, password);
      toast.success(t('auth.loginSuccess'));
      router.push(`/${locale}/admin`); // Success
    } catch (error: any) {
      console.error('[Login Error]', error);
      // 4. Map error message
      const msg = error.message || t('auth.invalidCredentials');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="instructor@example.com"
                {...register('email', { required: true })}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-500">Email is required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: true })}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-500">Password is required</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
