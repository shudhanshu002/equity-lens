"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Database,
    Loader2,
    Mail,
    RefreshCcw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
    X,
} from "lucide-react";
import {
    deleteAdminUser,
    formatAdminDate,
    getAdminUserDetails,
    getAdminUserDisplayName,
    getAdminUserInitials,
    getAdminUserProviderLabel,
    getAdminUsers,
    getAdminUserWorkspaceCount,
    updateAdminUser,
    type AdminUserDetails,
    type AdminUserListItem,
    type AdminUserRole,
} from "@/lib/user-data/admin-client";

export function AdminUsersPanel() {
    const { data: session, status } = useSession();

    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(
        null
    );

    const [search, setSearch] = useState("");
    const [role, setRole] = useState<"ALL" | AdminUserRole>("ALL");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [workingId, setWorkingId] = useState<string | null>(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isAdmin = session?.user?.role === "ADMIN";

    const loadUsers = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await getAdminUsers({
                search: search.trim() || undefined,
                role: role === "ALL" ? undefined : role,
                page,
                limit: 20,
            });

            setUsers(result.users);
            setTotalPages(result.pagination.totalPages || 1);
            setTotalUsers(result.pagination.totalUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin, page, role, search]);

    useEffect(() => {
        if (status !== "loading") {
            void loadUsers();
        }
    }, [loadUsers, status]);

    async function openUser(userId: string) {
        setDetailsLoading(true);
        setError("");

        try {
            const details = await getAdminUserDetails(userId);
            setSelectedUser(details);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load user details."
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    async function updateRole(userId: string, nextRole: AdminUserRole) {
        setWorkingId(userId);
        setMessage("");
        setError("");

        try {
            await updateAdminUser(userId, {
                role: nextRole,
            });

            setMessage("User role updated.");
            await loadUsers();

            if (selectedUser?.id === userId) {
                await openUser(userId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role.");
        } finally {
            setWorkingId(null);
        }
    }

    async function toggleEmailVerification(user: AdminUserDetails) {
        setWorkingId(user.id);
        setMessage("");
        setError("");

        try {
            await updateAdminUser(user.id, {
                emailVerified: !user.emailVerified,
            });

            setMessage("Email verification status updated.");
            await loadUsers();
            await openUser(user.id);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update verification status."
            );
        } finally {
            setWorkingId(null);
        }
    }

    async function removeUser(userId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user? This will delete all linked user data."
        );

        if (!confirmed) return;

        setWorkingId(userId);
        setMessage("");
        setError("");

        try {
            await deleteAdminUser(userId);

            setMessage("User deleted successfully.");
            setSelectedUser(null);
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete user.");
        } finally {
            setWorkingId(null);
        }
    }

    function applySearch() {
        setPage(1);
        void loadUsers();
    }

    if (status === "loading" || loading) {
        return <AdminLoadingState />;
    }

    if (!isAdmin) {
        return <AdminForbiddenState />;
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-9">
                    <div className="absolute right-[-15%] top-[-35%] h-96 w-96 rounded-full bg-red-400/20 blur-3xl dark:bg-red-400/10" />
                    <div className="absolute bottom-[-42%] left-[20%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />

                    <div className="relative">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-600 dark:text-red-300">
                            <ShieldAlert className="h-4 w-4" />
                            Admin Console
                        </div>

                        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                            Manage EquityLens users and workspace activity.
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                            Search users, inspect account providers, view workspace usage,
                            promote users to admin, verify emails, or remove accounts.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={() => void loadUsers()}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                                Refresh Users
                                <RefreshCcw className="h-4 w-4" />
                            </button>

                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-sm font-black text-emerald-700 dark:text-emerald-300">
                                <Database className="h-4 w-4" />
                                PostgreSQL Admin
                            </div>
                        </div>

                        {message && (
                            <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                {message}
                            </p>
                        )}

                        {error && (
                            <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-300">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    <AdminMetric
                        icon={<Users className="h-5 w-5" />}
                        label="Total Users"
                        value={String(totalUsers)}
                        helper="Matching filters"
                    />

                    <AdminMetric
                        icon={<ShieldCheck className="h-5 w-5" />}
                        label="Admins"
                        value={String(users.filter((user) => user.role === "ADMIN").length)}
                        helper="This page"
                    />

                    <AdminMetric
                        icon={<Database className="h-5 w-5" />}
                        label="Workspace Items"
                        value={String(
                            users.reduce(
                                (sum, user) => sum + getAdminUserWorkspaceCount(user),
                                0
                            )
                        )}
                        helper="This page"
                    />
                </div>
            </section>

            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 md:p-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">
                            User Directory
                        </p>

                        <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                            Search and manage users.
                        </h2>
                    </div>

                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                        Page {page} of {totalPages}
                    </div>
                </div>

                <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-white/10 dark:bg-slate-950/60">
                        <Search className="h-5 w-5 text-slate-400" />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    applySearch();
                                }
                            }}
                            placeholder="Search by name or email..."
                            className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                        />
                    </div>

                    <select
                        value={role}
                        onChange={(event) => {
                            setRole(event.target.value as "ALL" | AdminUserRole);
                            setPage(1);
                        }}
                        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="ADMIN">Admins</option>
                    </select>

                    <button
                        onClick={applySearch}
                        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        Search
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {users.length > 0 ? (
                    <div className="space-y-4">
                        {users.map((user) => (
                            <AdminUserRow
                                key={user.id}
                                user={user}
                                working={workingId === user.id}
                                onOpen={() => void openUser(user.id)}
                                onRoleChange={(nextRole) => void updateRole(user.id, nextRole)}
                                onDelete={() => void removeUser(user.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-slate-950/60">
                        <Users className="mx-auto h-10 w-10 text-slate-400" />

                        <h3 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                            No users found
                        </h3>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Try changing the search text or role filter.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-4">
                    <button
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                        className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                        Previous
                    </button>

                    <button
                        onClick={() =>
                            setPage((current) => Math.min(totalPages, current + 1))
                        }
                        disabled={page >= totalPages}
                        className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                        Next
                    </button>
                </div>
            </section>

            {detailsLoading && (
                <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-500">
                        Loading user details...
                    </p>
                </section>
            )}

            {selectedUser && (
                <AdminUserDetailsPanel
                    user={selectedUser}
                    working={workingId === selectedUser.id}
                    onClose={() => setSelectedUser(null)}
                    onToggleVerification={() => void toggleEmailVerification(selectedUser)}
                    onDelete={() => void removeUser(selectedUser.id)}
                    onRoleChange={(nextRole) =>
                        void updateRole(selectedUser.id, nextRole)
                    }
                />
            )}
        </div>
    );
}

function AdminUserRow({
    user,
    working,
    onOpen,
    onRoleChange,
    onDelete,
}: {
    user: AdminUserListItem;
    working: boolean;
    onOpen: () => void;
    onRoleChange: (role: AdminUserRole) => void;
    onDelete: () => void;
}) {
    return (
        <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 dark:hover:bg-white/[0.06]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={getAdminUserDisplayName(user)}
                                className="h-full w-full rounded-2xl object-cover"
                            />
                        ) : (
                            getAdminUserInitials(user)
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xl font-black text-slate-950 dark:text-white">
                                {getAdminUserDisplayName(user)}
                            </h3>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${user.role === "ADMIN"
                                        ? "bg-red-400/10 text-red-600 dark:text-red-300"
                                        : "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                                    }`}
                            >
                                {user.role}
                            </span>

                            {user.emailVerified && (
                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                                    Verified
                                </span>
                            )}
                        </div>

                        <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <Mail className="h-4 w-4" />
                            {user.email}
                        </p>

                        <p className="mt-2 text-xs font-bold text-slate-400">
                            {getAdminUserProviderLabel(user)} · Joined{" "}
                            {formatAdminDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:w-[360px]">
                    <MiniStat label="Watchlist" value={user.counts.watchlistItems} />
                    <MiniStat label="History" value={user.counts.historyItems} />
                    <MiniStat label="Exports" value={user.counts.exportItems} />
                </div>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={user.role}
                        onChange={(event) => onRoleChange(event.target.value as AdminUserRole)}
                        disabled={working}
                        className="h-11 rounded-full border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>

                    <button
                        onClick={onOpen}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-black text-white dark:bg-white dark:text-slate-950"
                    >
                        Details
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onDelete}
                        disabled={working}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-5 text-xs font-black text-red-600 disabled:opacity-60 dark:text-red-300"
                    >
                        {working ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

function AdminUserDetailsPanel({
    user,
    working,
    onClose,
    onToggleVerification,
    onDelete,
    onRoleChange,
}: {
    user: AdminUserDetails;
    working: boolean;
    onClose: () => void;
    onToggleVerification: () => void;
    onDelete: () => void;
    onRoleChange: (role: AdminUserRole) => void;
}) {
    return (
        <section className="rounded-[2.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 md:p-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-lg font-black text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={getAdminUserDisplayName(user)}
                                className="h-full w-full rounded-3xl object-cover"
                            />
                        ) : (
                            getAdminUserInitials(user)
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                            User Details
                        </p>

                        <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                            {getAdminUserDisplayName(user)}
                        </h2>

                        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            {user.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-4">
                <DetailMetric label="Role" value={user.role} />
                <DetailMetric label="Providers" value={getAdminUserProviderLabel(user)} />
                <DetailMetric
                    label="Workspace"
                    value={String(getAdminUserWorkspaceCount(user))}
                />
                <DetailMetric
                    label="Sessions"
                    value={String(user.counts.sessions)}
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                    <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                        Admin Actions
                    </h3>

                    <div className="space-y-3">
                        <select
                            value={user.role}
                            onChange={(event) =>
                                onRoleChange(event.target.value as AdminUserRole)
                            }
                            disabled={working}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none dark:border-white/10 dark:bg-white/10 dark:text-white"
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>

                        <button
                            onClick={onToggleVerification}
                            disabled={working}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-700 disabled:opacity-60 dark:text-emerald-300"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {user.emailVerified ? "Unverify Email" : "Verify Email"}
                        </button>

                        <button
                            onClick={onDelete}
                            disabled={working}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-red-600/20 disabled:opacity-60"
                        >
                            {working ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete User
                        </button>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
                    <h3 className="mb-5 text-xl font-black text-slate-950 dark:text-white">
                        Latest Activity
                    </h3>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <ActivityPreview
                            title="Watchlist"
                            items={user.watchlistItems.map((item) => item.company)}
                        />

                        <ActivityPreview
                            title="History"
                            items={user.historyItems.map((item) => item.title)}
                        />

                        <ActivityPreview
                            title="Exports"
                            items={user.exportItems.map((item) => item.title)}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-black text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                Admin actions directly affect production database records.
            </div>
        </section>
    );
}

function AdminMetric({
    icon,
    label,
    value,
    helper,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-red-600 dark:bg-white/10 dark:text-red-300">
                {icon}
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {value}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {helper}
            </p>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 break-words text-lg font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function ActivityPreview({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-sm font-black text-slate-950 dark:text-white">
                {title}
            </p>

            {items.length > 0 ? (
                <div className="space-y-2">
                    {items.slice(0, 5).map((item) => (
                        <p
                            key={item}
                            className="truncate rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-950/60 dark:text-slate-300"
                        >
                            {item}
                        </p>
                    ))}
                </div>
            ) : (
                <p className="text-sm font-bold text-slate-400">No activity</p>
            )}
        </div>
    );
}

function AdminLoadingState() {
    return (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04]">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />

            <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                Loading admin users
            </h2>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Checking admin access and fetching user records.
            </p>
        </section>
    );
}

function AdminForbiddenState() {
    return (
        <section className="rounded-[2.75rem] border border-red-400/20 bg-red-400/10 p-8 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />

            <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
                Admin access required
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                This panel is only available to users with the ADMIN role.
            </p>
        </section>
    );
}