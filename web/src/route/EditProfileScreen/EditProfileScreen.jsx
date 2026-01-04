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

const EditProfileScreen = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: 'Shahroz Butt',
        username: 'shahroz_butt',
        email: 'shahroz.butt@gmail.com',
        phone: '+92 300 1234567',
        bio: 'Personalized AI News & Reports 📑 | Stay informed with curated content tailored to your interests. Exploring technology, business, and innovation.',
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleChange = (field, value) => {
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
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
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
                setAvatarPreview(reader.result);
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

        setIsSaving(true);
        setShowSuccess(false);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save to localStorage
            const profileData = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            if (avatarPreview) {
                localStorage.setItem('userAvatar', avatarPreview);
            }

            setShowSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors(prev => ({ ...prev, general: 'Failed to save profile. Please try again.' }));
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, icon: Icon, field, type = 'text', placeholder, maxLength, required = false }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px',
            }}>
                {Icon && <Icon size={16} color="#64748b" />}
                {label}
                {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#0f172a',
                    border: errors[field] ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = errors[field] ? '#ef4444' : '#0f172a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = errors[field] ? '#ef4444' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                }}
            />
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
                    color: '#9ca3af',
                    marginTop: '4px',
                    textAlign: 'right',
                }}>
                    {formData[field].length} / {maxLength}
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            paddingTop: '0',
            marginTop: '0',
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
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <ArrowLeft size={20} color="#0f172a" />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.5px',
                        }}>
                            Edit Profile
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: '#64748b',
                            margin: '0',
                        }}>
                            Update your profile information
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac',
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
                            color: '#166534',
                        }}>
                            Profile updated successfully!
                        </span>
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
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
                            color: '#991b1b',
                        }}>
                            {errors.general}
                        </span>
                    </div>
                )}

                {/* Profile Card */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '32px',
                    marginBottom: '24px',
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
                                backgroundColor: avatarPreview ? 'transparent' : '#0f172a',
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
                                        color: '#ffffff',
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
                                    backgroundColor: '#0f172a',
                                    border: '3px solid #ffffff',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1e293b';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0f172a';
                                }}
                            >
                                <Camera size={16} color="#ffffff" />
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
                                border: '1px solid #e5e7eb',
                                background: '#ffffff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#0f172a',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0f172a';
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.backgroundColor = '#ffffff';
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
                    <InputField
                        label="Full Name"
                        icon={User}
                        field="name"
                        placeholder="Enter your full name"
                        required
                        maxLength={50}
                    />

                    <InputField
                        label="Username"
                        icon={AtSign}
                        field="username"
                        placeholder="Enter username"
                        required
                        maxLength={30}
                    />

                    <InputField
                        label="Email"
                        icon={Mail}
                        field="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                    />

                    <InputField
                        label="Phone Number"
                        icon={Phone}
                        field="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                    />

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#0f172a',
                            marginBottom: '8px',
                        }}>
                            <FileText size={16} color="#64748b" />
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
                                color: '#0f172a',
                                border: errors.bio ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#ffffff',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = errors.bio ? '#ef4444' : '#0f172a';
                                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.bio ? '#ef4444' : '#e5e7eb';
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
                            color: '#9ca3af',
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
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#0f172a',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = '#ffffff';
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
                            background: isSaving ? '#94a3b8' : '#0f172a',
                            borderRadius: '8px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSaving) {
                                e.currentTarget.style.backgroundColor = '#1e293b';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSaving) {
                                e.currentTarget.style.backgroundColor = '#0f172a';
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
                                    border: '2px solid #ffffff',
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
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default EditProfileScreen;
