import React from 'react';
import { Newspaper, TrendingUp, BookOpen, Search, Globe, Clock, Radio, Video, Share2, Bookmark, Eye, Heart } from 'lucide-react';

const NewsBackgroundAnimation = () => {
    // News-related icons - many more for continuous flow
    const newsIcons = [
        { icon: Newspaper, delay: 0, duration: 18, size: 45, x: '5%' },
        { icon: TrendingUp, delay: 1, duration: 22, size: 38, x: '12%' },
        { icon: BookOpen, delay: 2, duration: 20, size: 42, x: '20%' },
        { icon: Search, delay: 0.5, duration: 24, size: 36, x: '28%' },
        { icon: Globe, delay: 1.5, duration: 21, size: 48, x: '35%' },
        { icon: Clock, delay: 2.5, duration: 19, size: 34, x: '42%' },
        { icon: Radio, delay: 0.8, duration: 23, size: 40, x: '50%' },
        { icon: Video, delay: 1.8, duration: 17, size: 37, x: '58%' },
        { icon: Share2, delay: 2.8, duration: 25, size: 35, x: '65%' },
        { icon: Bookmark, delay: 0.3, duration: 21, size: 39, x: '72%' },
        { icon: Eye, delay: 1.3, duration: 19, size: 33, x: '80%' },
        { icon: Heart, delay: 2.3, duration: 22, size: 36, x: '88%' },
        { icon: Newspaper, delay: 0.6, duration: 20, size: 44, x: '8%' },
        { icon: TrendingUp, delay: 1.6, duration: 18, size: 41, x: '15%' },
        { icon: Globe, delay: 2.6, duration: 24, size: 46, x: '25%' },
        { icon: BookOpen, delay: 0.9, duration: 22, size: 38, x: '33%' },
        { icon: Search, delay: 1.9, duration: 19, size: 40, x: '45%' },
        { icon: Clock, delay: 2.9, duration: 23, size: 35, x: '55%' },
        { icon: Video, delay: 0.4, duration: 21, size: 43, x: '62%' },
        { icon: Radio, delay: 1.4, duration: 17, size: 37, x: '70%' },
        { icon: Share2, delay: 2.4, duration: 20, size: 39, x: '78%' },
        { icon: Bookmark, delay: 0.7, duration: 25, size: 36, x: '85%' },
        { icon: Eye, delay: 1.7, duration: 18, size: 42, x: '92%' },
        { icon: Heart, delay: 2.7, duration: 22, size: 34, x: '3%' },
    ];

    // Floating news category cards - more variety
    const newsCards = [
        { text: 'Tech', delay: 0, duration: 14, x: '8%', y: '15%' },
        { text: 'Sports', delay: 0.5, duration: 16, x: '75%', y: '20%' },
        { text: 'Politics', delay: 1, duration: 15, x: '25%', y: '25%' },
        { text: 'Science', delay: 1.5, duration: 17, x: '82%', y: '30%' },
        { text: 'Business', delay: 2, duration: 18, x: '45%', y: '35%' },
        { text: 'Health', delay: 2.5, duration: 13, x: '12%', y: '40%' },
        { text: 'Entertainment', delay: 0.3, duration: 19, x: '68%', y: '45%' },
        { text: 'World', delay: 0.8, duration: 16, x: '35%', y: '50%' },
        { text: 'Finance', delay: 1.3, duration: 14, x: '88%', y: '55%' },
        { text: 'Culture', delay: 1.8, duration: 17, x: '18%', y: '60%' },
        { text: 'Climate', delay: 2.3, duration: 15, x: '58%', y: '65%' },
        { text: 'AI', delay: 2.8, duration: 18, x: '78%', y: '70%' },
        { text: 'Space', delay: 0.2, duration: 16, x: '5%', y: '75%' },
        { text: 'Education', delay: 0.7, duration: 19, x: '52%', y: '80%' },
        { text: 'Innovation', delay: 1.2, duration: 14, x: '92%', y: '85%' },
    ];

    // News headlines - floating text
    const newsHeadlines = [
        { text: 'Breaking News', delay: 0, duration: 20, x: '10%', size: 11 },
        { text: 'Trending Now', delay: 1, duration: 22, x: '30%', size: 10 },
        { text: 'Latest Updates', delay: 2, duration: 18, x: '50%', size: 12 },
        { text: 'Top Stories', delay: 0.5, duration: 24, x: '70%', size: 11 },
        { text: 'Hot Topics', delay: 1.5, duration: 19, x: '15%', size: 10 },
        { text: 'Must Read', delay: 2.5, duration: 21, x: '60%', size: 12 },
        { text: 'In Focus', delay: 0.8, duration: 23, x: '85%', size: 11 },
        { text: 'Exclusive', delay: 1.8, duration: 17, x: '25%', size: 10 },
        { text: 'Live Updates', delay: 2.8, duration: 20, x: '45%', size: 11 },
        { text: 'Editor\'s Pick', delay: 0.3, duration: 25, x: '75%', size: 12 },
    ];

    // Mini article cards
    const articleCards = [
        { title: 'Tech Innovation', category: 'Technology', delay: 0, duration: 16, x: '12%' },
        { title: 'Sports Victory', category: 'Sports', delay: 1, duration: 18, x: '40%' },
        { title: 'Policy Change', category: 'Politics', delay: 2, duration: 17, x: '68%' },
        { title: 'New Discovery', category: 'Science', delay: 0.5, duration: 19, x: '20%' },
        { title: 'Market Update', category: 'Business', delay: 1.5, duration: 15, x: '55%' },
        { title: 'Health Alert', category: 'Health', delay: 2.5, duration: 21, x: '82%' },
        { title: 'Entertainment News', category: 'Entertainment', delay: 0.8, duration: 20, x: '8%' },
        { title: 'Global Event', category: 'World', delay: 1.8, duration: 18, x: '35%' },
        { title: 'Financial Report', category: 'Finance', delay: 2.8, duration: 16, x: '72%' },
        { title: 'Cultural Event', category: 'Culture', delay: 0.3, duration: 22, x: '28%' },
        { title: 'Climate Action', category: 'Climate', delay: 1.3, duration: 19, x: '65%' },
        { title: 'AI Breakthrough', category: 'AI', delay: 2.3, duration: 17, x: '90%' },
    ];

    return (
        <>
            <style>{`
                @keyframes floatUp {
                    0% {
                        transform: translateY(110vh) rotate(0deg) scale(0.8);
                        opacity: 0;
                    }
                    5% {
                        opacity: 0.15;
                    }
                    50% {
                        opacity: 0.25;
                        transform: translateY(50vh) rotate(180deg) scale(1);
                    }
                    95% {
                        opacity: 0.15;
                    }
                    100% {
                        transform: translateY(-10vh) rotate(360deg) scale(0.8);
                        opacity: 0;
                    }
                }

                @keyframes floatUpFast {
                    0% {
                        transform: translateY(110vh) rotate(0deg) scale(0.7);
                        opacity: 0;
                    }
                    8% {
                        opacity: 0.2;
                    }
                    92% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translateY(-10vh) rotate(360deg) scale(0.7);
                        opacity: 0;
                    }
                }

                @keyframes floatDiagonal {
                    0% {
                        transform: translate(0, 110vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.18;
                    }
                    50% {
                        transform: translate(30px, 50vh) rotate(180deg);
                        opacity: 0.22;
                    }
                    90% {
                        opacity: 0.18;
                    }
                    100% {
                        transform: translate(60px, -10vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                @keyframes floatSide {
                    0% {
                        transform: translateX(-100px) translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.2;
                    }
                    50% {
                        transform: translateX(0) translateY(-15px) rotate(90deg);
                        opacity: 0.25;
                    }
                    90% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translateX(100px) translateY(-30px) rotate(180deg);
                        opacity: 0;
                    }
                }

                @keyframes floatWave {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0.15;
                    }
                    25% {
                        transform: translateY(-20px) translateX(15px) rotate(90deg);
                        opacity: 0.25;
                    }
                    50% {
                        transform: translateY(-10px) translateX(30px) rotate(180deg);
                        opacity: 0.2;
                    }
                    75% {
                        transform: translateY(-25px) translateX(15px) rotate(270deg);
                        opacity: 0.25;
                    }
                    100% {
                        transform: translateY(0) translateX(0) rotate(360deg);
                        opacity: 0.15;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.15;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.3;
                        transform: scale(1.2);
                    }
                }

                @keyframes rotate {
                    0% {
                        transform: rotate(0deg) scale(1);
                        opacity: 0.2;
                    }
                    50% {
                        transform: rotate(180deg) scale(1.1);
                        opacity: 0.3;
                    }
                    100% {
                        transform: rotate(360deg) scale(1);
                        opacity: 0.2;
                    }
                }

                .news-icon-float {
                    position: fixed;
                    pointer-events: none;
                    color: rgba(15, 23, 42, 0.12);
                    animation: floatUp linear infinite;
                    z-index: 0;
                }

                .news-icon-fast {
                    position: fixed;
                    pointer-events: none;
                    color: rgba(15, 23, 42, 0.1);
                    animation: floatUpFast linear infinite;
                    z-index: 0;
                }

                .news-icon-diagonal {
                    position: fixed;
                    pointer-events: none;
                    color: rgba(15, 23, 42, 0.1);
                    animation: floatDiagonal linear infinite;
                    z-index: 0;
                }

                .news-card-float {
                    position: fixed;
                    pointer-events: none;
                    background: rgba(15, 23, 42, 0.05);
                    border: 1px solid rgba(15, 23, 42, 0.08);
                    border-radius: 8px;
                    padding: 6px 14px;
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(15, 23, 42, 0.35);
                    animation: floatSide linear infinite;
                    z-index: 0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .news-headline {
                    position: fixed;
                    pointer-events: none;
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(15, 23, 42, 0.25);
                    animation: floatWave 8s ease-in-out infinite;
                    z-index: 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .news-article-card {
                    position: fixed;
                    pointer-events: none;
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(15, 23, 42, 0.1);
                    border-radius: 6px;
                    padding: 8px 12px;
                    width: 140px;
                    animation: floatDiagonal linear infinite;
                    z-index: 0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .news-article-title {
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(15, 23, 42, 0.4);
                    margin-bottom: 4px;
                }

                .news-article-category {
                    font-size: 8px;
                    color: rgba(15, 23, 42, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .news-pulse {
                    position: fixed;
                    pointer-events: none;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(15, 23, 42, 0.04) 0%, transparent 70%);
                    animation: pulse 3s ease-in-out infinite;
                    z-index: 0;
                }

                .news-rotate {
                    position: fixed;
                    pointer-events: none;
                    color: rgba(15, 23, 42, 0.08);
                    animation: rotate 15s linear infinite;
                    z-index: 0;
                }
            `}</style>
            
            {/* Floating News Icons - Multiple streams */}
            {newsIcons.map((item, index) => {
                const Icon = item.icon;
                const animationClass = index % 3 === 0 ? 'news-icon-float' : 
                                      index % 3 === 1 ? 'news-icon-fast' : 'news-icon-diagonal';
                return (
                    <div
                        key={`icon-${index}`}
                        className={animationClass}
                        style={{
                            left: item.x,
                            animationDuration: `${item.duration}s`,
                            animationDelay: `${item.delay}s`,
                        }}
                    >
                        <Icon size={item.size} />
                    </div>
                );
            })}

            {/* Floating News Category Cards */}
            {newsCards.map((card, index) => (
                <div
                    key={`card-${index}`}
                    className="news-card-float"
                    style={{
                        left: card.x,
                        top: card.y,
                        animationDuration: `${card.duration}s`,
                        animationDelay: `${card.delay}s`,
                    }}
                >
                    {card.text}
                </div>
            ))}

            {/* Floating News Headlines */}
            {newsHeadlines.map((headline, index) => (
                <div
                    key={`headline-${index}`}
                    className="news-headline"
                    style={{
                        left: headline.x,
                        top: `${10 + (index % 5) * 18}%`,
                        fontSize: `${headline.size}px`,
                        animationDelay: `${headline.delay}s`,
                    }}
                >
                    {headline.text}
                </div>
            ))}

            {/* Mini Article Cards */}
            {articleCards.map((article, index) => (
                <div
                    key={`article-${index}`}
                    className="news-article-card"
                    style={{
                        left: article.x,
                        top: `${15 + (index % 4) * 20}%`,
                        animationDuration: `${article.duration}s`,
                        animationDelay: `${article.delay}s`,
                    }}
                >
                    <div className="news-article-title">{article.title}</div>
                    <div className="news-article-category">{article.category}</div>
                </div>
            ))}

            {/* Pulse Effects - More of them */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <div
                    key={`pulse-${index}`}
                    className="news-pulse"
                    style={{
                        left: `${10 + (index % 4) * 25}%`,
                        top: `${20 + Math.floor(index / 4) * 30}%`,
                        animationDelay: `${index * 0.8}s`,
                    }}
                />
            ))}

            {/* Rotating Icons */}
            {[0, 1, 2, 3, 4].map((index) => {
                const icons = [Newspaper, TrendingUp, Globe, BookOpen, Search];
                const Icon = icons[index % icons.length];
                return (
                    <div
                        key={`rotate-${index}`}
                        className="news-rotate"
                        style={{
                            left: `${15 + index * 18}%`,
                            top: `${25 + (index % 3) * 25}%`,
                            animationDelay: `${index * 2}s`,
                        }}
                    >
                        <Icon size={50} />
                    </div>
                );
            })}
        </>
    );
};

export default NewsBackgroundAnimation;

