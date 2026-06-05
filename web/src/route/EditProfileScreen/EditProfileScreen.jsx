import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Camera, 
    User, 
    Mail, 
    Phone, 
    AtSign,
    FileText,
    CheckCircle,
    X,
    AlertCircle
} from 'lucide-react';
import { getProfile, updateProfile } from '../../utils/Service/api';
import { writeProfileCache, dispatchProfileUpdated } from '../../utils/profileCache';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { SkeletonPageBlocks } from '../../components/skeletons/SkeletonLayouts';

const EditProfileScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const fileInputRef = useRef(null);

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const textTertiary = colors.textTertiary || colors.textSecondary;
    const borderColor = colors.border;
    const inputBg = isDark ? colors.surfaceElevated || colors.backgroundSecondary : colors.surface;
    const hoverBg = isDark ? colors.surfaceElevated : colors.backgroundSecondary;
    const action = filledActionColors(colors, isDark);
    const focusRing = isDark ? '0 0 0 3px rgba(129, 140, 248, 0.22)' : '0 0 0 3px rgba(15, 23, 42, 0.1)';
    
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    React.useEffect(() => {
        (async () => {
            try {
                const profile = await getProfile();
                const email = profile?.email || '';
                setFormData((prev) => ({
                    ...prev,
                    name: profile?.full_name || prev.name,
                    username: profile?.username || (email ? String(email).split('@')[0] : prev.username),
                    email,
                    phone: profile?.phone || prev.phone,
                    bio: profile?.bio || prev.bio,
                }));
                if (profile?.avatar_image) setAvatarPreview(profile.avatar_image);
            } catch {
                // Keep defaults when profile endpoint is unavailable.
            } finally {
                setProfileLoading(false);
            }
        })();
    }, []);

    const handleChange = (field, value) => {
        if (field === 'email') return;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'No email on file';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB' }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
                return;
            }
            
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = String(reader.result || '');
                setAvatarPreview(dataUrl);
            };
            reader.readAsDataURL(file);
            
            if (errors.avatar) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.avatar;
                    return newErrors;
                });
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        const startedAt = Date.now();
        setIsSaving(true);
        setShowSuccess(false);

        try {
            const updated = await updateProfile({
                full_name: formData.name,
                username: formData.username,
                phone: formData.phone,
                bio: formData.bio,
                avatar_image: avatarPreview || '',
            });
            writeProfileCache(updated);
            dispatchProfileUpdated(updated);

            setShowSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors(prev => ({ ...prev, general: 'Failed to save profile. Please try again.' }));
        } finally {
            const elapsed = Date.now() - startedAt;
            if (elapsed < 600) {
                await new Promise((resolve) => setTimeout(resolve, 600 - elapsed));
            }
            setIsSaving(false);
        }
    };

    const renderInputField = ({
        label,
        icon: Icon,
        field,
        type = 'text',
        placeholder,
        maxLength,
        required = false,
        readOnly = false,
        hint,
    }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: textPrimary,
                marginBottom: '8px',
            }}>
                {Icon && <Icon size={16} color={textSecondary} />}
                {label}
                {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
                type={type}
                value={formData[field]}
                readOnly={readOnly}
                onChange={readOnly ? undefined : (e) => handleChange(field, e.target.value)}
                placeholder={readOnly ? (formData[field] || '—') : placeholder}
                maxLength={maxLength}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: textPrimary,
                    border: errors[field] ? '2px solid #ef4444' : `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    backgroundColor: readOnly ? (isDark ? colors.backgroundSecondary : colors.backgroundSecondary) : inputBg,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: readOnly ? 'not-allowed' : 'text',
                    opacity: readOnly ? 0.85 : 1,
                }}
                onFocus={readOnly ? undefined : (e) => {
                    e.target.style.borderColor = errors[field] ? '#ef4444' : colors.primary;
                    e.target.style.boxShadow = focusRing;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = errors[field] ? '#ef4444' : borderColor;
                    e.target.style.boxShadow = 'none';
                }}
            />
            {hint ? (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: textSecondary, lineHeight: 1.4 }}>{hint}</p>
            ) : null}
            {errors[field] && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    fontSize: '13px',
                    color: '#ef4444',
                }}>
                    <AlertCircle size={14} />
                    {errors[field]}
                </div>
            )}
            {maxLength && (
                <div style={{
                    fontSize: '12px',
                    color: textTertiary,
                    marginTop: '4px',
                    textAlign: 'right',
                }}>
                    {formData[field].length} / {maxLength}
                </div>
            )}
        </div>
    );

    return (
        <div
            className="edit-profile-screen"
            style={{
            minHeight: '100vh',
            backgroundColor,
            paddingTop: '0',
            marginTop: '0',
            position: 'relative',
        }}>
            <div style={{
                maxWidth: '700px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px',
                    paddingTop: '0',
                    marginTop: '0',
                }}>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            padding: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <ArrowLeft size={20} color={textPrimary} />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.5px',
                        }}>
                            Edit Profile
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0',
                        }}>
                            Update your profile information
                        </p>
                    </div>
                </div>

                {profileLoading ? (
                    <SkeletonPageBlocks isDark={isDark} colors={colors} minHeight="520px" />
                ) : null}

                {!profileLoading && (
                <>
                {/* Success Message */}
                {showSuccess && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4',
                        border: `1px solid ${isDark ? 'rgba(134, 239, 172, 0.45)' : '#86efac'}`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <CheckCircle size={20} color="#10b981" />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: isDark ? '#86efac' : '#166534',
                        }}>
                            Profile updated successfully!
                        </span>
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
                        border: `1px solid ${isDark ? 'rgba(248, 113, 113, 0.45)' : '#fecaca'}`,
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <AlertCircle size={20} color="#ef4444" />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: isDark ? '#fca5a5' : '#991b1b',
                        }}>
                            {errors.general}
                        </span>
                    </div>
                )}

                {/* Profile Card */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                    marginBottom: '24px',
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    {/* Avatar Section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '32px',
                    }}>
                        <div style={{
                            position: 'relative',
                            marginBottom: '16px',
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '12px',
                                backgroundColor: avatarPreview ? 'transparent' : action.background,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}>
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Profile" 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <span style={{
                                        fontSize: '48px',
                                        fontWeight: '700',
                                        color: action.foreground,
                                        letterSpacing: '0.5px',
                                    }}>
                                        {formData.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: action.background,
                                    border: `3px solid ${cardBackground}`,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.88';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                            >
                                <Camera size={16} color={action.foreground} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '8px 16px',
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: textPrimary,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.backgroundColor = hoverBg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = borderColor;
                                e.currentTarget.style.backgroundColor = inputBg;
                            }}
                        >
                            Change Photo
                        </button>
                        {errors.avatar && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '13px',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}>
                                <AlertCircle size={14} />
                                {errors.avatar}
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    {renderInputField({
                        label: "Full Name",
                        icon: User,
                        field: "name",
                        placeholder: "Enter your full name",
                        required: true,
                        maxLength: 50,
                    })}

                    {renderInputField({
                        label: "Username",
                        icon: AtSign,
                        field: "username",
                        placeholder: "Enter username",
                        required: true,
                        maxLength: 30,
                    })}

                    {renderInputField({
                        label: "Email",
                        icon: Mail,
                        field: "email",
                        type: "email",
                        readOnly: true,
                        hint: 'Your sign-in email cannot be changed here.',
                    })}

                    {renderInputField({
                        label: "Phone Number",
                        icon: Phone,
                        field: "phone",
                        type: "tel",
                        placeholder: "Enter your phone number",
                        required: true,
                    })}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: textPrimary,
                            marginBottom: '8px',
                        }}>
                            <FileText size={16} color={textSecondary} />
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={500}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '15px',
                                fontWeight: '500',
                                color: textPrimary,
                                border: errors.bio ? '2px solid #ef4444' : `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                backgroundColor: inputBg,
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = errors.bio ? '#ef4444' : colors.primary;
                                e.target.style.boxShadow = focusRing;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.bio ? '#ef4444' : borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        {errors.bio && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '6px',
                                fontSize: '13px',
                                color: '#ef4444',
                            }}>
                                <AlertCircle size={14} />
                                {errors.bio}
                            </div>
                        )}
                        <div style={{
                            fontSize: '12px',
                            color: textTertiary,
                            marginTop: '4px',
                            textAlign: 'right',
                        }}>
                            {formData.bio.length} / 500
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                }}>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            border: `1px solid ${borderColor}`,
                            background: cardBackground,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: textPrimary,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary;
                            e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.backgroundColor = cardBackground;
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            border: 'none',
                            background: isSaving ? textTertiary : action.background,
                            borderRadius: '8px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: action.foreground,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSaving) {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = isDark
                                    ? '0 4px 12px rgba(0, 0, 0, 0.35)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSaving) {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        {isSaving ? (
                            <>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: `2px solid ${action.foreground}`,
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
                </>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .edit-profile-screen input::placeholder,
                .edit-profile-screen textarea::placeholder {
                    color: ${textSecondary};
                    opacity: 0.75;
                }
            `}</style>
        </div>
    );
};

export default EditProfileScreen;
