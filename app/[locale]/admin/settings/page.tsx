"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    User,
    Lock,
    ShieldCheck,
    UserCircle,
    Mail,
    Save,
    Loader2
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useAuth } from '@/lib/contexts/auth-context'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    bio: z.string().optional(),
    email: z.string().email("Invalid email address"),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
    const t = useTranslations('admin.settings')
    const { user } = useAuth()
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            bio: user?.bio || "",
        },
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onUpdateProfile = async (values: ProfileFormValues) => {
        setIsUpdatingProfile(true)
        try {
            await authApi.updateProfile(values)
            toast.success(t('update_success'))
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const onChangePassword = async (values: PasswordFormValues) => {
        setIsChangingPassword(true)
        try {
            await authApi.changePassword(values)
            toast.success(t('password_success'))
            passwordForm.reset()
        } catch (error) {
            toast.error('Failed to change password')
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t('title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('description')}</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-2">
                    <TabsTrigger value="profile" className="rounded-xl py-3 px-6 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-lg transition-all text-sm sm:text-base">
                        <UserCircle className="me-2 h-5 w-5" />
                        {t('profile')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl py-3 px-6 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-lg transition-all text-sm sm:text-base">
                        <ShieldCheck className="me-2 h-5 w-5" />
                        {t('security')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8 animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 gap-8">
                        <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden border-none ring-1 ring-slate-200 dark:ring-white/5">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-black">{t('profile')}</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">{t('profile_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={profileForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-bold">{t('firstName')}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                <Input placeholder="First Name" className="ps-10 rounded-xl h-12 bg-white dark:bg-slate-950" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-bold">{t('lastName')}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Last Name" className="rounded-xl h-12 bg-white dark:bg-slate-950" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={profileForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">{t('email')}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input placeholder="Email" className="ps-10 rounded-xl h-12 bg-slate-50 dark:bg-slate-950 cursor-not-allowed opacity-70" {...field} disabled />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={profileForm.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">{t('bio')}</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={t('bioPlaceholder')}
                                                            className="min-h-[120px] rounded-xl bg-white dark:bg-slate-950 resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <Button type="submit" disabled={isUpdatingProfile} className="w-full sm:w-auto px-10 rounded-xl font-black h-12 text-lg shadow-lg shadow-primary/20">
                                            {isUpdatingProfile ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Save className="me-2 h-5 w-5" />}
                                            {t('save_changes')}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="animate-in fade-in-50 duration-500">
                    <Card className="rounded-[2.5rem] border-none ring-1 ring-slate-200 dark:ring-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-2xl font-black">{t('security')}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">{t('security_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 max-w-2xl">
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">{t('current_password')}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <Input type="password" placeholder="••••••••" className="ps-10 rounded-xl h-12 bg-white dark:bg-slate-950" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">{t('new_password')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" className="rounded-xl h-12 bg-white dark:bg-slate-950" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">{t('confirm_password')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" className="rounded-xl h-12 bg-white dark:bg-slate-950" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                                        <ShieldCheck className="inline-block me-2 h-4 w-4 text-primary" />
                                        {t('password_requirements')}
                                    </p>

                                    <Button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto px-10 rounded-xl font-black h-12 text-lg shadow-lg shadow-primary/20">
                                        {isChangingPassword ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="me-2 h-5 w-5" />}
                                        {t('change_password')}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
