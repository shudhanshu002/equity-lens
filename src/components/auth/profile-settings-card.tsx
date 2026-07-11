"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    CheckCircle2,
    Loader2,
    Mail,
    Save,
    ShieldCheck,
    User,
    UserCircle2,
} from "lucide-react";
import {
    formatProfileDate,
    getProfileDisplayName,
    getProfileInitials,
    getUserProfile,
    isEmailVerified,
    updateUserProfile,
    type UserProfile,
} from "@/lib/user-data/profile-client";

export function ProfileSettingsCard() {
    const { status, update } = useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loggedIn = status === "authenticated";

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setError("");

            try {
                if (!loggedIn) {
                    setProfile(null);
                    return;
                }

                const userProfile = await getUserProfile();

                setProfile(userProfile);
                setName(userProfile.name ?? "");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        }

        if (status !== "loading") {
            void loadProfile();
        }
    }, [loggedIn, status]);

    async function saveProfile() {
        const cleanedName = name.trim();

        if (!cleanedName) {
            setError("Name is required.");
            return;
        }

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const updatedProfile = await updateUserProfile({
                name: cleanedName,
            });

            setProfile(updatedProfile);
            setName(updatedProfile.name ?? "");

            await update();

            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            Loading profile
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Fetching account details.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!loggedIn) {
        return (
            <section className="rounded-[2.5rem] border border-amber-400/20 bg-amber-400/10 p-6 md:p-8">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        <UserCircle2 className="h-7 w-7" />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                            Profile
                        </p>

                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            Login to manage your profile.
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                            Your profile, settings, watchlist, history, and exports are linked
                            to your authenticated account.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
            <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-xl font-black text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                        {profile?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.image}
                                alt={getProfileDisplayName(profile)}
                                className="h-full w-full rounded-3xl object-cover"
                            />
                        ) : (
                            getProfileInitials(profile)
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                            User Profile
                        </p>

                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                            {getProfileDisplayName(profile)}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <Mail className="h-4 w-4" />
                            {profile?.email}
                        </p>
                    </div>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${isEmailVerified(profile)
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                        }`}
                >
                    {isEmailVerified(profile) ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <ShieldCheck className="h-4 w-4" />
                    )}
                    {isEmailVerified(profile) ? "Verified" : "Not Verified"}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
                <div>
                    <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                        Display Name
                    </label>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-white/10 dark:bg-slate-950/60">
                            <User className="h-5 w-5 text-slate-400" />

                            <input
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setMessage("");
                                    setError("");
                                }}
                                placeholder="Enter your name"
                                className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                            />
                        </div>

                        <button
                            onClick={() => void saveProfile()}
                            disabled={saving || !name.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving
                                </>
                            ) : (
                                <>
                                    Save
                                    <Save className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {message && (
                        <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                            {error}
                        </p>
                    )}
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                        Account Metadata
                    </p>

                    <div className="space-y-3 text-sm">
                        <MetaRow label="Role" value={profile?.role ?? "USER"} />

                        <MetaRow
                            label="Joined"
                            value={
                                profile?.createdAt ? formatProfileDate(profile.createdAt) : "-"
                            }
                        />

                        <MetaRow
                            label="Updated"
                            value={
                                profile?.updatedAt ? formatProfileDate(profile.updatedAt) : "-"
                            }
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function MetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0 dark:border-white/10">
            <span className="font-bold text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <span className="font-black text-slate-950 dark:text-white">{value}</span>
        </div>
    );
}