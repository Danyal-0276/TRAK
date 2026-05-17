import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NewsCard } from "../../components/NewsCard";
import { useTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import { 
    Edit, 
    Settings, 
    Bookmark, 
    User, 
    Mail, 
    Phone, 
    Calendar,
    LogOut,
    CheckCircle,
    TrendingUp,
    Users,
    BookOpen,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import {
    addBookmark,
    clearAuthTokens,
    confirmProfileVerification,
    getCurrentUser,
    getProfile,
    getUserArticleDetail,
    listBookmarks,
    removeBookmark,
    requestProfileVerification,
    setReaction,
    updateProfile,
} from "../../utils/Service/api";
import { useAuth } from "../../context/AuthContext";
import { useUIFeedback } from "../../components/ui/UIFeedback";
import { getBookmarkIds, setBookmarkIds } from "../../utils/bookmarksStorage";
import { getReactionMap, mergeReactionRows, setReactionForArticle } from "../../utils/reactionsStorage";

function profileCacheKey() {
    const u = getCurrentUser();
    const id = u?.id ?? u?.pk;
    return id != null ? `trak_profile_cache_v1_${id}` : 'trak_profile_cache_v1_guest';
}

function profileBookmarksCacheKey() {
    const u = getCurrentUser();
    const id = u?.id ?? u?.pk;
    return id != null ? `trak_profile_bookmarks_cache_v1_${id}` : 'trak_profile_bookmarks_cache_v1_guest';
}

function stripLastLogin(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const { last_login: _ignored, ...rest } = obj;
    return rest;
}

const UserProfileScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [verificationChannel, setVerificationChannel] = useState("email");
    const [verificationCode, setVerificationCode] = useState("");
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [devCodeHint, setDevCodeHint] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");
    const { confirm } = useUIFeedback();
    const fileInputRef = useRef(null);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [showAvatarPreview, setShowAvatarPreview] = useState(false);
    const [userStats, setUserStats] = useState({
        following: 0,
        followers: 0,
        saved: 0,
    });
    const [pageReady, setPageReady] = useState(false);

    const horizontalPad = isMobile ? 16 : isTablet ? 20 : 24;

    useEffect(() => {
        try {
            const cachedProfile = window.localStorage.getItem(profileCacheKey());
            if (cachedProfile) setProfile(stripLastLogin(JSON.parse(cachedProfile)));
            const cachedRows = window.localStorage.getItem(profileBookmarksCacheKey());
            if (cachedRows) {
                const rows = JSON.parse(cachedRows);
                if (Array.isArray(rows) && rows.length) {
                    setBookmarks(rows);
                    setBookmarkedItems(new Set(rows.map((r) => String(r.id))));
                }
            } else {
                const ids = getBookmarkIds();
                if (ids.length) setBookmarkedItems(new Set(ids));
            }
            setVotedItems(getReactionMap());
        } catch {}
        loadBookmarks();
    }, [authUser?.id, authUser?.pk]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const profileData = stripLastLogin(await getProfile());
            setProfile(profileData);
            window.localStorage.setItem(profileCacheKey(), JSON.stringify(profileData));
            const bookmarkPayload = await listBookmarks().catch(() => ({ results: [] }));
            const rows = bookmarkPayload.results || [];
            const detailed = await Promise.all(
                rows.map(async (row) => {
                    const aid = String(row.article_id ?? "").trim();
                    try {
                        const full = await getUserArticleDetail(aid);
                        const likes = Number(full.like_count ?? full.upvotes ?? 0);
                        const dislikes = Number(full.dislike_count ?? 0);
                        return {
                            ...full,
                            id: aid,
                            like_count: likes,
                            dislike_count: dislikes,
                            upvotes: likes,
                            description: full.excerpt || full.summary || '',
                            excerpt: full.excerpt || full.summary || '',
                            content: full.content || full.full_content || '',
                            fullContent: full.full_content || full.content || '',
                        };
                    } catch {
                        return {
                            id: aid,
                            title: row.title || "Saved article",
                            source: "TRAK",
                            excerpt: row.url || "",
                            description: row.url || "",
                            canonical_url: row.url || "",
                            fullContent: row.url || "",
                            category: "Saved",
                            time: row.created_at ? new Date(row.created_at).toLocaleString() : "Recently",
                            like_count: 0,
                            dislike_count: 0,
                            upvotes: 0,
                            votes: 0,
                        };
                    }
                })
            );
            const bookmarkedArticles = detailed.filter(Boolean);
            setBookmarkedItems(new Set(bookmarkedArticles.map((b) => String(b.id))));
            setBookmarkIds(bookmarkedArticles.map((b) => String(b.id)));
            setBookmarks(bookmarkedArticles);
            window.localStorage.setItem(profileBookmarksCacheKey(), JSON.stringify(bookmarkedArticles));
            setUserStats({
                following: Number(profileData?.following_count || 0),
                followers: Number(profileData?.followers_count || 0),
                saved: bookmarkedArticles.length,
            });
        } catch (error) {
            console.error("Error loading bookmarks:", error);
        } finally {
            setLoading(false);
            setPageReady(true);
        }
    };

    const handleLogout = async () => {
        const shouldLogout = await confirm({
            title: 'Log out?',
            message: 'Are you sure you want to log out?',
            confirmText: 'Log out',
            danger: true,
        });
        if (shouldLogout) {
            clearAuthTokens();
            navigate('/login');
        }
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        try {
            const data = await setReaction(
                id,
                newVote === "up" ? "like" : newVote === "down" ? "dislike" : "none"
            );
            const likes = Number(data.like_count ?? 0);
            const dislikes = Number(data.dislike_count ?? 0);
            setBookmarks((prev) =>
                prev.map((n) =>
                    String(n.id) !== id
                        ? n
                        : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes }
                )
            );
        } catch {
            setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
            setReactionForArticle(id, previousVote || null);
        }
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems((prev) => {
            const next = new Set([...prev].map(String));
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setBookmarkIds(Array.from(next));
            return next;
        });
        try {
            const item = bookmarks.find((n) => String(n.id) === id);
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, item?.title || "", item?.canonical_url || item?.url || "");
            await loadBookmarks();
        } catch {
            await loadBookmarks();
        }
    };

    const items = [
        { label: 'Following', value: userStats.following, icon: Users },
        { label: 'Followers', value: userStats.followers, icon: TrendingUp },
        { label: 'Saved', value: userStats.saved, icon: BookOpen },
    ];

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';
    const isAdmin = profile?.role === "admin";
    const emailVerified = isAdmin ? true : Boolean(profile?.email_verified);
    const phoneVerified = isAdmin ? true : Boolean(profile?.phone_verified);

    const sendVerificationCode = async () => {
        setSendingCode(true);
        setVerifyMessage("");
        setDevCodeHint("");
        try {
            const payload = verificationChannel === "phone" ? { channel: "phone", phone: profile?.phone || "" } : { channel: "email" };
            const result = await requestProfileVerification(payload);
            setVerifyMessage(result?.detail || "Verification code sent.");
            if (result?.dev_code) {
                setDevCodeHint(String(result.dev_code));
            }
        } catch (error) {
            setVerifyMessage(error?.message || "Failed to send verification code.");
        } finally {
            setSendingCode(false);
        }
    };

    const confirmVerificationCode = async () => {
        if (!verificationCode.trim()) {
            setVerifyMessage("Please enter the code first.");
            return;
        }
        setVerifyingCode(true);
        setVerifyMessage("");
        try {
            const updated = stripLastLogin(await confirmProfileVerification({ channel: verificationChannel, code: verificationCode.trim() }));
            setProfile(updated);
            setVerificationCode("");
            setDevCodeHint("");
            setVerifyMessage(`${verificationChannel === "email" ? "Email" : "Phone"} verified successfully.`);
        } catch (error) {
            setVerifyMessage(error?.message || "Invalid code.");
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const dataUrl = String(reader.result || "");
                const updated = stripLastLogin(await updateProfile({ avatar_image: dataUrl }));
                setProfile(updated);
            } catch {
                // ignore avatar update errors to keep profile usable
            }
        };
        reader.readAsDataURL(file);
    };

    if (!pageReady && !profile) {
        const sk = isDark ? colors.surfaceElevated || '#334155' : '#e5e7eb';
        return (
            <div style={{ minHeight: '100vh', backgroundColor: backgroundColor, paddingTop: 0 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: `0 ${horizontalPad}px 24px` }}>
                    <div style={{ height: 28, width: 120, background: sk, borderRadius: 6, marginBottom: 20, marginTop: 8 }} />
                    <div style={{ height: 220, background: cardBackground, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <div style={{ width: 100, height: 100, borderRadius: 12, background: sk }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: 24, width: '45%', background: sk, borderRadius: 6, marginBottom: 12 }} />
                                <div style={{ height: 16, width: '30%', background: sk, borderRadius: 6, marginBottom: 16 }} />
                                <div style={{ height: 14, width: '100%', background: sk, borderRadius: 6, marginBottom: 8 }} />
                                <div style={{ height: 14, width: '90%', background: sk, borderRadius: 6 }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${borderColor}` }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ height: 72, background: sk, borderRadius: 8 }} />
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 18, width: 160, background: sk, borderRadius: 6, marginBottom: 16 }} />
                    <div style={{ height: 120, background: sk, borderRadius: 12 }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                width: '100%',
                padding: `0 ${horizontalPad}px 24px`,
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Profile
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Profile Header Card */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                    marginBottom: '32px',
                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '24px',
                        marginBottom: '24px',
                    }}>
                        {/* Avatar */}
                        <div
                            onMouseDown={() => setShowAvatarMenu(true)}
                            style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0,
                            boxShadow: isDark ? '0 4px 12px rgba(129, 140, 248, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            cursor: 'pointer',
                        }}>
                            {profile?.avatar_image ? (
                                <img src={profile.avatar_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    letterSpacing: '0.5px',
                                }}>
                                    {(profile?.full_name || profile?.email || 'U').trim().charAt(0).toUpperCase()}
                                </span>
                            )}
                            {showAvatarMenu ? (
                                <div style={{
                                    position: 'absolute',
                                    top: '104px',
                                    left: 0,
                                    background: cardBackground,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    zIndex: 12,
                                    minWidth: '160px',
                                }}>
                                    <button type="button" onClick={() => { setShowAvatarMenu(false); fileInputRef.current?.click(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer' }}>Change image</button>
                                    <button type="button" onClick={() => { setShowAvatarMenu(false); if (profile?.avatar_image) setShowAvatarPreview(true); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: profile?.avatar_image ? textPrimary : textSecondary, cursor: profile?.avatar_image ? 'pointer' : 'not-allowed' }}>Display image</button>
                                </div>
                            ) : null}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                        </div>

                        {/* User Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px',
                            }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: textPrimary,
                                    margin: '0',
                                    letterSpacing: '-0.5px',
                                }}>
                                    {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
                                </h2>
                                {(profile?.email_verified || profile?.phone_verified) && (
                                    <CheckCircle size={18} color="#2563eb" fill="#2563eb" />
                                )}
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: textSecondary,
                                marginBottom: '12px',
                            }}>
                                @{profile?.username || (profile?.email || "user").split("@")[0]}
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: isDark ? colors.textSecondary || '#CBD5E1' : '#374151',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                            }}>
                                {profile?.bio || "Set up your profile details and verify email/phone for a trusted badge."}
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Mail size={14} color={textSecondary} />
                                    <span>{profile?.email || "No email"}</span>
                                    <span style={{ marginLeft: 6, color: emailVerified ? "#2563eb" : "#ef4444", fontSize: 12 }}>
                                        {emailVerified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Phone size={14} color={textSecondary} />
                                    <span>{profile?.phone || "No phone added"}</span>
                                    <span style={{ marginLeft: 6, color: phoneVerified ? "#2563eb" : "#ef4444", fontSize: 12 }}>
                                        {phoneVerified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Calendar size={14} color={textSecondary} />
                                    <span>Joined Jan 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        paddingTop: '24px',
                        borderTop: `1px solid ${borderColor}`,
                    }}>
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    onClick={() => {
                                        if (item.label === 'Saved') navigate('/bookmarks');
                                    }}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                                        borderRadius: '8px',
                                        border: `1px solid ${borderColor}`,
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        cursor: item.label === 'Saved' ? 'pointer' : 'default',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (item.label !== 'Saved') return;
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f3f4f6';
                                        e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (item.label !== 'Saved') return;
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                        e.currentTarget.style.borderColor = borderColor;
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '8px',
                                    }}>
                                        <Icon size={20} color={textSecondary} />
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: textPrimary,
                                        marginBottom: '4px',
                                    }}>
                                        {item.value}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                        fontWeight: '500',
                                    }}>
                                        {item.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: `1px solid ${borderColor}`,
                    }}>
                        <button
                            onClick={() => navigate('/edit-profile')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primaryDark || '#6366F1' : '#1e293b';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = isDark 
                                    ? '0 4px 12px rgba(129, 140, 248, 0.3)' 
                                    : '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Edit size={16} />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: cardBackground,
                                color: textPrimary,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = cardBackground;
                                e.currentTarget.style.borderColor = borderColor;
                            }}
                        >
                            <Settings size={16} />
                            Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: cardBackground,
                                color: '#ef4444',
                                border: '1px solid #fee2e2',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = cardBackground;
                                e.currentTarget.style.borderColor = '#fee2e2';
                            }}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>

                    {!isAdmin && (!emailVerified || !phoneVerified) && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            borderRadius: '10px',
                            border: `1px solid ${borderColor}`,
                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f8fafc',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color={textPrimary} />
                                <span style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
                                    Verify your account
                                </span>
                            </div>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: textSecondary }}>
                                Request a code and enter it below to verify your email or phone.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => setVerificationChannel("email")} style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${verificationChannel === "email" ? (isDark ? colors.primary || '#818CF8' : '#0f172a') : borderColor}`, background: verificationChannel === "email" ? (isDark ? 'rgba(129,140,248,0.15)' : '#eef2ff') : 'transparent', cursor: 'pointer', color: textPrimary, fontSize: '12px', fontWeight: 600 }}>Email</button>
                                <button type="button" onClick={() => setVerificationChannel("phone")} style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${verificationChannel === "phone" ? (isDark ? colors.primary || '#818CF8' : '#0f172a') : borderColor}`, background: verificationChannel === "phone" ? (isDark ? 'rgba(129,140,248,0.15)' : '#eef2ff') : 'transparent', cursor: 'pointer', color: textPrimary, fontSize: '12px', fontWeight: 600 }}>Phone</button>
                                <button type="button" onClick={sendVerificationCode} disabled={sendingCode} style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', background: isDark ? colors.primary || '#818CF8' : '#0f172a', color: '#fff', cursor: sendingCode ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                    {sendingCode ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                                    {sendingCode ? "Sending..." : "Send Code"}
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter verification code"
                                    style={{ flex: '1 1 220px', minWidth: '220px', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: cardBackground, color: textPrimary, fontSize: '13px' }}
                                />
                                <button type="button" onClick={confirmVerificationCode} disabled={verifyingCode} style={{ padding: '9px 14px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: 'transparent', color: textPrimary, cursor: verifyingCode ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                                    {verifyingCode ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                                    {verifyingCode ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                            {verifyMessage ? (
                                <div style={{ marginTop: '10px', fontSize: '12px', color: textSecondary }}>
                                    {verifyMessage}
                                </div>
                            ) : null}
                            {devCodeHint ? (
                                <div style={{ marginTop: '6px', fontSize: '12px', color: isDark ? '#c7d2fe' : '#3730a3' }}>
                                    Test code: <strong>{devCodeHint}</strong>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Bookmarks Section */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px',
                    }}>
                        <Bookmark size={24} color={textPrimary} />
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0',
                        }}>
                            Saved Articles
                        </h2>
                        {bookmarks.length > 0 && (
                            <span style={{
                                fontSize: '14px',
                                color: textSecondary,
                                fontWeight: '500',
                            }}>
                                ({bookmarks.length})
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '300px',
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                border: `3px solid ${borderColor}`,
                                borderTop: `3px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '80px 20px',
                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                            borderRadius: '12px',
                            border: `1px solid ${borderColor}`,
                        }}>
                            <Bookmark size={48} color={textSecondary} style={{ marginBottom: '16px' }} />
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: textPrimary,
                                margin: '0 0 8px 0',
                            }}>
                                No saved articles
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: '0',
                                textAlign: 'center',
                            }}>
                                Articles you bookmark will appear here
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '20px',
                        }}>
                            {bookmarks.map((item) => (
                                <NewsCard
                                    key={item.id}
                                    item={item}
                                    onPress={() => navigate(`/article/${item.id}`, { state: { article: item } })}
                                    votedItems={votedItems}
                                    bookmarkedItems={bookmarkedItems}
                                    onVote={handleVote}
                                    onBookmark={handleBookmark}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showAvatarPreview ? (
                <div onClick={() => setShowAvatarPreview(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <img src={profile?.avatar_image} alt="Avatar preview" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px' }} />
                </div>
            ) : null}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default UserProfileScreen;
