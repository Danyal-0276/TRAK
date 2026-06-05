import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NewsCard } from "../../components/NewsCard";
import { MasonryFeed, MasonryFeedSkeleton } from "../../components/MasonryFeed";
import { getSkeletonFeedProps } from "../../components/skeletons/SkeletonLayouts";
import { useTheme } from "../../theme/ThemeContext";
import { filledActionColors } from "../../theme/buttonContrast";
import { useResponsive } from "../../hooks/useResponsive";
import {
    Edit,
    Settings,
    Bookmark,
    Mail,
    Phone,
    Calendar,
    LogOut,
    CheckCircle,
    Users,
    BookOpen,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react';
import './ProfileScreen.css';
import {
    addBookmark,
    clearAuthTokens,
    confirmProfileVerification,
    getCurrentUser,
    getProfile,
    getUserArticleDetail,
    listBookmarks,
    listReactions,
    removeBookmark,
    requestProfileVerification,
    setReaction,
    updateProfile,
} from "../../utils/Service/api";
import { useAuth } from "../../context/AuthContext";
import { useUIFeedback } from "../../components/ui/UIFeedback";
import { getBookmarkIds, setBookmarkIds } from "../../utils/bookmarksStorage";
import { getReactionMap, mergeReactionRows, setReactionForArticle } from "../../utils/reactionsStorage";
import { patchArticleVoteRow, reactionApiValue } from "../../utils/reactionVote";
import { mapApiItem } from "../../utils/loadFeed";

import {
    profileCacheKey,
    writeProfileCache,
    dispatchProfileUpdated,
} from '../../utils/profileCache';

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

function formatJoined(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
        return null;
    }
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
        liked: 0,
        disliked: 0,
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
            writeProfileCache(profileData);
            dispatchProfileUpdated(profileData);
            const [bookmarkPayload, reactPayload] = await Promise.all([
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const rows = bookmarkPayload.results || [];
            const reactions = reactPayload.results || [];
            const liked = reactions.filter((r) => String(r.reaction || '').toLowerCase() === 'like').length;
            const disliked = reactions.filter((r) => String(r.reaction || '').toLowerCase() === 'dislike').length;
            setUserStats({ liked, disliked, saved: rows.length });
            const detailed = await Promise.all(
                rows.map(async (row) => {
                    const aid = String(row.article_id ?? "").trim();
                    try {
                        const full = await getUserArticleDetail(aid);
                        const mapped = mapApiItem({ ...full, id: aid });
                        return {
                            ...mapped,
                            id: aid,
                            description: mapped.excerpt || mapped.summary || '',
                            excerpt: mapped.excerpt || mapped.summary || '',
                            summary: mapped.summary || mapped.excerpt || '',
                            content: mapped.content || mapped.fullContent || '',
                            fullContent: mapped.fullContent || mapped.content || '',
                            category: full.topic_keywords?.[0] || mapped.category || 'Saved',
                            time: full.published_at
                                ? new Date(full.published_at).toLocaleString()
                                : (row.created_at ? new Date(row.created_at).toLocaleString() : mapped.time || 'Recently'),
                            verified: full.credibility?.label === 'real',
                            trending: Boolean(full.topic_keywords?.length),
                            image: full.image || full.image_url || mapped.image,
                        };
                    } catch {
                        return {
                            id: aid,
                            title: row.title || "Saved article",
                            source: "TRAK",
                            excerpt: "",
                            description: "",
                            summary: "",
                            content: "",
                            canonical_url: row.url || "",
                            fullContent: "",
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
                liked,
                disliked,
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

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id] ?? null;
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        setBookmarks((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(n, previousVote, newVote)))
        );

        (async () => {
            try {
                const data = await setReaction(id, reactionApiValue(newVote));
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setBookmarks((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: newVote }
                    )
                );
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
                setBookmarks((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id ? n : patchArticleVoteRow(n, newVote, previousVote)
                    )
                );
            }
        })();
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

    const statItems = [
        { label: 'Liked', value: userStats.liked, icon: ThumbsUp, onClick: () => navigate('/liked') },
        { label: 'Disliked', value: userStats.disliked, icon: ThumbsDown, onClick: () => navigate('/disliked') },
        { label: 'Saved', value: userStats.saved, icon: BookOpen, onClick: () => navigate('/bookmarks') },
    ];

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;
    const accent = colors.primary;
    const accentSoft = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const action = filledActionColors(colors, isDark);
    const joinedLabel = formatJoined(profile?.date_joined);
    const isAdmin = profile?.role === 'admin';
    const emailVerified = isAdmin ? true : Boolean(profile?.email_verified);
    const phoneVerified = isAdmin ? true : Boolean(profile?.phone_verified);
    const feedGap = isMobile ? 16 : isTablet ? 20 : 24;

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
                writeProfileCache(updated);
                dispatchProfileUpdated(updated);
            } catch {
                // ignore avatar update errors to keep profile usable
            }
        };
        reader.readAsDataURL(file);
    };

    if (!pageReady && !profile) {
        const sk = isDark ? colors.surfaceElevated : '#e5e7eb';
        return (
            <div style={{ minHeight: '100vh', backgroundColor: backgroundColor, paddingTop: 0 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: `0 ${horizontalPad}px 24px` }}>
                    <div className="trak-sk-pulse" style={{ height: 28, width: 120, backgroundColor: sk, borderRadius: 6, marginBottom: 20, marginTop: 8 }} />
                    <div style={{ height: 220, background: cardBackground, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <div className="trak-sk-pulse" style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: sk }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: 24, width: '45%', backgroundColor: sk, borderRadius: 6, marginBottom: 12 }} />
                                <div style={{ height: 16, width: '30%', backgroundColor: sk, borderRadius: 6, marginBottom: 16 }} />
                                <div style={{ height: 14, width: '100%', backgroundColor: sk, borderRadius: 6, marginBottom: 8 }} />
                                <div style={{ height: 14, width: '90%', backgroundColor: sk, borderRadius: 6 }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${borderColor}` }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ height: 72, backgroundColor: sk, borderRadius: 8 }} />
                            ))}
                        </div>
                    </div>
                    <div className="trak-sk-pulse" style={{ height: 18, width: 160, backgroundColor: sk, borderRadius: 6, marginBottom: 16 }} />
                    <MasonryFeedSkeleton count={4} gap={20} {...getSkeletonFeedProps(isDark, colors)} />
                </div>
            </div>
        );
    }

    const profileVars = {
        '--profile-border': borderColor,
        '--profile-surface': cardBackground,
        '--profile-bg-secondary': isDark ? colors.surfaceElevated : '#f8fafc',
        '--profile-accent': accent,
        '--profile-accent-soft': accentSoft,
        '--profile-avatar-bg': action.background,
        '--profile-avatar-fg': action.foreground,
    };

    const ActionRow = ({ icon: Icon, label, subtitle, onClick, danger }) => (
        <button type="button" className="trak-profile-action-row" onClick={onClick}>
            <span className={`trak-profile-action-icon${danger ? ' danger' : ''}`}>
                <Icon size={18} color={danger ? '#ef4444' : accent} strokeWidth={2.25} />
            </span>
            <span className="trak-profile-action-text">
                <span className="trak-profile-action-label" style={{ color: danger ? '#ef4444' : textPrimary }}>
                    {label}
                </span>
                {subtitle ? (
                    <span className="trak-profile-action-sub" style={{ color: textSecondary }}>
                        {subtitle}
                    </span>
                ) : null}
            </span>
            <ChevronRight size={18} color={textSecondary} />
        </button>
    );

    return (
        <div className="trak-profile" style={{ ...profileVars, backgroundColor }}>
            <div
                className="trak-profile-inner"
                style={{ padding: `0 ${horizontalPad}px 48px` }}
            >
                <div className="trak-profile-hero" style={{ marginBottom: 20 }}>
                    <div className="trak-profile-hero-band">
                        <div className="trak-profile-hero-glow" />
                    </div>
                    <div className="trak-profile-avatar-wrap">
                        <div
                            className="trak-profile-avatar"
                            onMouseDown={() => setShowAvatarMenu(true)}
                            role="button"
                            tabIndex={0}
                        >
                            {profile?.avatar_image ? (
                                <img src={profile.avatar_image} alt="Profile" />
                            ) : (
                                <span className="trak-profile-avatar-initials">
                                    {(profile?.full_name || profile?.email || 'U').trim().charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {(profile?.email_verified || profile?.phone_verified) && (
                            <div className="trak-profile-verified-dot">
                                <CheckCircle size={16} color={colors.primary} fill={colors.primary} />
                            </div>
                        )}
                        {showAvatarMenu ? (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginTop: 8,
                                    background: cardBackground,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    zIndex: 20,
                                    minWidth: '160px',
                                    overflow: 'hidden',
                                }}
                            >
                                <button type="button" onClick={() => { setShowAvatarMenu(false); fileInputRef.current?.click(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer' }}>Change image</button>
                                <button type="button" onClick={() => { setShowAvatarMenu(false); if (profile?.avatar_image) setShowAvatarPreview(true); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: profile?.avatar_image ? textPrimary : textSecondary, cursor: profile?.avatar_image ? 'pointer' : 'not-allowed' }}>Display image</button>
                            </div>
                        ) : null}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                    </div>

                    <div className="trak-profile-hero-content trak-profile-body">
                        <h2 className="trak-profile-name" style={{ color: textPrimary }}>
                            {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
                        </h2>
                        <p className="trak-profile-username" style={{ color: textSecondary }}>
                            @{profile?.username || (profile?.email || 'user').split('@')[0]}
                        </p>
                        <p className="trak-profile-bio" style={{ color: textSecondary }}>
                            {profile?.bio || 'Add a short bio so others know what you follow.'}
                        </p>

                        <div className="trak-profile-chips">
                            {profile?.email ? (
                                <div className="trak-profile-chip" style={{ color: textSecondary }}>
                                    <Mail size={14} color={textSecondary} />
                                    <span>{profile.email}</span>
                                    <span style={{ color: emailVerified ? '#16a34a' : textSecondary }}>{emailVerified ? '✓' : '·'}</span>
                                </div>
                            ) : null}
                            {profile?.phone ? (
                                <div className="trak-profile-chip" style={{ color: textSecondary }}>
                                    <Phone size={14} color={textSecondary} />
                                    <span>{profile.phone}</span>
                                    <span style={{ color: phoneVerified ? '#16a34a' : textSecondary }}>{phoneVerified ? '✓' : '·'}</span>
                                </div>
                            ) : null}
                            {joinedLabel ? (
                                <div className="trak-profile-chip" style={{ color: textSecondary }}>
                                    <Calendar size={14} color={textSecondary} />
                                    <span>Joined {joinedLabel}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="trak-profile-stats" style={{ padding: '0 24px 20px' }}>
                        {statItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    onClick={item.onClick || undefined}
                                    className={item.onClick ? 'trak-profile-stat trak-profile-stat-clickable' : 'trak-profile-stat'}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: isDark ? colors.surfaceElevated : '#f8fafc',
                                        borderRadius: '14px',
                                        border: `1px solid ${borderColor}`,
                                        textAlign: 'center',
                                        cursor: item.onClick ? 'pointer' : 'default',
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
                                        {item.value ?? 0}
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

                </div>

                <h2 className="trak-profile-section-title" style={{ color: textPrimary }}>Account</h2>
                <div className="trak-profile-actions">
                    <ActionRow icon={Edit} label="Edit profile" subtitle="Name, bio, avatar, contact info" onClick={() => navigate('/edit-profile')} />
                    <ActionRow icon={Settings} label="Settings" subtitle="Notifications, interests, privacy" onClick={() => navigate('/settings')} />
                    <ActionRow icon={LogOut} label="Log out" subtitle="Sign out of this device" onClick={handleLogout} danger />
                </div>

                <section className="trak-profile-saved">
                <div className="trak-profile-saved-header">
                    <div className="trak-profile-saved-title-row">
                        <div className="trak-profile-saved-icon">
                            <Bookmark size={18} color={accent} strokeWidth={2.25} />
                        </div>
                        <div>
                            <h2 className="trak-profile-section-title" style={{ color: textPrimary, margin: 0 }}>
                                Saved articles
                            </h2>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: textSecondary, fontWeight: 500 }}>
                                {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                            </p>
                        </div>
                    </div>
                </div>

                    {loading ? (
                        <MasonryFeedSkeleton count={isMobile ? 4 : 6} gap={feedGap} {...getSkeletonFeedProps(isDark, colors)} />
                    ) : bookmarks.length === 0 ? (
                        <div className="trak-profile-empty">
                            <div className="trak-profile-empty-icon">
                                <Bookmark size={28} color={accent} strokeWidth={2} />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: '0 0 6px' }}>
                                Nothing saved yet
                            </h3>
                            <p style={{ fontSize: 14, color: textSecondary, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                                Bookmark articles from your feed and they will show up here.
                            </p>
                        </div>
                    ) : (
                        <MasonryFeed gap={feedGap}>
                            {bookmarks.map((item) => (
                                <NewsCard
                                    key={item.id}
                                    item={item}
                                    layout="masonry"
                                    onPress={() => navigate(`/article/${item.id}`, { state: { article: item } })}
                                    votedItems={votedItems}
                                    bookmarkedItems={bookmarkedItems}
                                    onVote={handleVote}
                                    onBookmark={handleBookmark}
                                />
                            ))}
                        </MasonryFeed>
                    )}
                </section>
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
