// ============================================
// FILE: services/mockApi.js
// ============================================
export const mockApi = {
    delay: (ms = 800) => new Promise(resolve => setTimeout(resolve, ms)),
    
    getNewsFeed: async (category = 'all', page = 1) => {
        await mockApi.delay();
        
        const allNews = [
            {
                id: 1,
                source: 'BBC News',
                time: '2h ago',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                title: 'Pakistan Clinches Dramatic Victory in T20 Thriller Against Australia',
                excerpt: 'In a nail-biting finish at the Melbourne Cricket Ground, Pakistan secured a last-ball victory with exceptional performances from both batting and bowling units.',
                content: 'Pakistan secured a thrilling last-ball victory against Australia in the T20 international match. Babar Azam\'s masterclass innings of 87* off 52 balls guided Pakistan to a challenging total of 189/4.',
                fullContent: `Pakistan pulled off a stunning last-ball victory against Australia in a thrilling T20 international match at the Melbourne Cricket Ground. The match, which kept fans on the edge of their seats until the final delivery, showcased exceptional cricket from both teams.

Batting first, Pakistan posted a competitive total of 189/4 in their 20 overs, thanks to a masterclass innings from captain Babar Azam. The right-hander remained unbeaten on 87 off just 52 deliveries, an innings studded with 8 fours and 4 sixes. His partnership of 112 runs with Mohammad Rizwan (45 off 31) for the second wicket laid the foundation for Pakistan's formidable total.

Australia's chase got off to a shaky start as they lost both openers within the powerplay. However, a counter-attacking 73 off 41 balls from Glenn Maxwell and a composed 56 from Marcus Stoinis brought Australia back into the contest. The match went down to the wire, with Australia needing 12 runs off the final over.

Pakistan's death bowling specialist Haris Rauf held his nerve in the final over, conceding just 11 runs and picking up the crucial wicket of Stoinis on the penultimate delivery. Australia fell agonizingly short by just one run, ending on 188/7.

This victory marks Pakistan's third consecutive win in the T20 series and puts them in a commanding position with a 3-1 lead. The final match of the five-match series will be played in Sydney next week.`,
                categories: ['Sports', 'Cricket', 'International'],
                category: 'Sports',
                verified: true,
                trending: true,
                votes: 1247,
                readTime: 5,
            },
            {
                id: 2,
                source: 'TechCrunch',
                time: '4h ago',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                title: 'Revolutionary Quantum Computing Breakthrough Achieved by Tech Giants',
                excerpt: 'Scientists announce a major milestone in quantum computing that could transform encryption, drug discovery, and artificial intelligence within the next decade.',
                content: 'A consortium of tech giants including Google, IBM, and Microsoft have announced a groundbreaking achievement in quantum computing with 1000+ stable qubits.',
                fullContent: `A consortium of leading technology companies including Google, IBM, and Microsoft has announced a groundbreaking achievement in quantum computing that researchers are calling the most significant breakthrough in the field to date.

The collaborative project has successfully created a quantum computer with over 1,000 stable qubits, shattering the previous record of 433 qubits. More importantly, the system maintains quantum coherence for an unprecedented 10 minutes, solving one of the field's most persistent challenges.

Dr. Sarah Chen, lead researcher at Google's Quantum AI lab, explained: "This isn't just about having more qubits. We've fundamentally solved the error correction problem that has plagued quantum computing for decades. Our system can now perform complex calculations that would take classical supercomputers thousands of years to complete."

The breakthrough has immediate implications for several fields. In cryptography, the system demonstrated the ability to factor large numbers exponentially faster than any classical computer, raising both opportunities and concerns for data security. In drug discovery, researchers successfully simulated complex molecular interactions that were previously impossible to model.

The pharmaceutical company Pfizer has already partnered with the consortium to use the technology for developing new medicines. Early simulations have identified three potential drug candidates for treating Alzheimer's disease, a process that traditionally takes years of laboratory work.

The technology is expected to be commercially available within the next five years, though the initial systems will be housed in specialized facilities due to the extreme cooling requirements. The consortium has announced plans to make the computing power available through cloud services, democratizing access to quantum computing capabilities.`,
                categories: ['Technology', 'Science', 'Innovation'],
                category: 'Technology',
                verified: true,
                trending: true,
                votes: 2341,
                readTime: 7,
            },
            {
                id: 3,
                source: 'The Guardian',
                time: '6h ago',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                title: 'Historic Climate Agreement: 195 Nations Commit to Net-Zero by 2045',
                excerpt: 'World leaders unite in Geneva to sign the most ambitious climate accord in history, with binding commitments and unprecedented funding for green technology.',
                content: 'In a historic moment at the Geneva Climate Summit, 195 nations have unanimously agreed to achieve net-zero carbon emissions by 2045, five years ahead of previous targets.',
                fullContent: `In an unprecedented display of global cooperation, 195 nations have signed the Geneva Climate Accord, the most ambitious and binding climate agreement in human history. The pact commits all signatories to achieving net-zero carbon emissions by 2045, five years ahead of previous Paris Agreement targets.

The agreement, negotiated over two weeks of intense discussions, includes several groundbreaking provisions. Developed nations have committed to a $500 billion annual fund to help developing countries transition to renewable energy. This represents a fivefold increase from previous climate financing commitments.

UN Secretary-General António Guterres called the agreement "humanity's best chance to avoid catastrophic climate change." The accord includes binding emissions reduction targets with penalties for non-compliance, a provision that had been a major sticking point in previous negotiations.

Key provisions include a complete phase-out of coal power by 2035, with exceptions for least developed countries who have until 2040. The agreement mandates that 75% of new vehicle sales must be electric by 2030, rising to 100% by 2035. Deforestation must halt completely by 2030, with signatories committing to restore an area of forest the size of India by 2045.

The breakthrough came when China and the United States, the world's two largest emitters, jointly announced enhanced commitments. China pledged to peak emissions by 2027 and achieve carbon neutrality by 2043, while the US committed to 80% emissions reduction by 2035.

Environmental groups have cautiously welcomed the agreement. Greenpeace International director Jennifer Morgan stated: "This is the agreement we needed, but implementation will be everything. We'll be watching closely to ensure these commitments translate into real-world action."

The agreement establishes a new International Climate Court to adjudicate disputes and enforce compliance. Countries failing to meet interim targets will face trade sanctions and reduced access to international climate financing.`,
                categories: ['Environment', 'Politics', 'Global'],
                category: 'Environment',
                verified: true,
                trending: false,
                votes: 3128,
                readTime: 8,
            },
            {
                id: 4,
                source: 'Financial Times',
                time: '8h ago',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                title: 'Global Markets Rally as Economic Indicators Show Strong Recovery',
                excerpt: 'Stock markets worldwide hit record highs as manufacturing data and employment figures exceed expectations, signaling robust economic growth.',
                content: 'Global financial markets experienced significant gains today. The S&P 500 rose 2.3%, while Asian and European markets posted strong performances.',
                fullContent: `Global financial markets experienced a dramatic surge today, with major indices hitting record highs as a wave of positive economic data reinforced investor confidence in the strength of the global economic recovery.

The S&P 500 jumped 2.3% to close at 5,847 points, surpassing its previous record. The Dow Jones Industrial Average gained 456 points (1.8%), while the tech-heavy Nasdaq Composite soared 3.1%, led by strong performances from semiconductor and artificial intelligence companies.

The rally extended beyond US borders. Japan's Nikkei 225 rose 2.7%, Hong Kong's Hang Seng gained 3.2%, and European markets showed similar strength with the FTSE 100 up 1.9% and Germany's DAX advancing 2.4%.

The optimism was fueled by better-than-expected manufacturing data from China, which showed factory activity expanding at its fastest pace in 18 months. The Purchasing Managers' Index (PMI) came in at 52.7, well above the 50-point threshold that separates expansion from contraction.

US employment figures also beat forecasts, with 275,000 jobs added in the latest month, significantly above the 200,000 expected. The unemployment rate held steady at 3.6%, while wage growth remained moderate at 3.8% year-over-year, easing concerns about inflation.

"We're seeing a goldilocks scenario - strong growth without overheating inflation," said Michael Peterson, chief economist at Morgan Stanley. "This gives central banks room to maintain supportive monetary policies while the recovery continues."

The bond market reflected this optimism, with yields on 10-year Treasury notes rising slightly to 3.87% as investors moved from safe-haven assets into riskier equities. Corporate bond spreads tightened, indicating improved confidence in business credit quality.

Technology stocks led the gains, with semiconductor manufacturers particularly strong. Nvidia rose 5.2%, AMD gained 4.8%, and Intel climbed 3.9% on reports of surging demand for AI processors. Apple added 2.7% following upbeat iPhone sales projections.

Energy stocks also performed well despite stable oil prices, as investors bet on increased economic activity driving future demand. Exxon Mobil and Chevron both gained approximately 2.5%.

Analysts cautioned that while the economic data is encouraging, geopolitical tensions and upcoming central bank decisions could introduce volatility. However, the overall consensus remains positive for continued market strength through the year.`,
                categories: ['Business', 'Finance', 'Economy'],
                category: 'Business',
                verified: true,
                trending: true,
                votes: 892,
                readTime: 6,
            },
            {
                id: 5,
                source: 'National Geographic',
                time: '10h ago',
                timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
                title: 'Rare Snow Leopards Spotted in Record Numbers Across Himalayas',
                excerpt: 'Conservation efforts pay off as camera traps reveal a 40% increase in snow leopard populations across protected regions in the Himalayan ranges.',
                content: 'Wildlife conservationists celebrate a remarkable achievement as snow leopard populations show a 40% increase across Himalayan protected areas.',
                fullContent: `Wildlife conservationists are celebrating a remarkable achievement as camera trap surveys reveal snow leopard populations have increased by 40% across protected regions in the Himalayan mountain range, marking one of the most successful large carnivore conservation stories in recent history.

The comprehensive survey, conducted over three years across 12 countries including Nepal, India, Bhutan, Pakistan, and China, deployed over 5,000 camera traps covering 250,000 square kilometers of snow leopard habitat. The results show an estimated population of 8,745 snow leopards, up from approximately 6,250 in the previous survey conducted in 2015.

Dr. Rinjan Shrestha, lead researcher for the Snow Leopard Trust, attributes the success to coordinated conservation efforts: "This represents a decade of intensive work involving local communities, governments, and international organizations. We've tackled poaching, protected prey species, and most importantly, created economic incentives for communities to coexist with these magnificent cats."

The increase is particularly dramatic in Nepal's Annapurna Conservation Area, where numbers have more than doubled. Local communities have been central to this success through innovative insurance programs that compensate herders for livestock losses to snow leopards, reducing retaliatory killings.

In Pakistan's northern regions, community-based conservation has transformed former hunting grounds into protected areas. Village conservation committees now monitor snow leopard populations and have developed wildlife tourism that provides alternative income. One community in Hunza Valley has reported seeing snow leopards more frequently than ever before.

The surveys also revealed new insights into snow leopard behavior. Camera traps captured unprecedented footage of snow leopards successfully hunting at lower elevations than previously documented, suggesting the species may be adapting to changing conditions. Researchers also documented several individuals living successfully in proximity to human settlements, indicating improved tolerance levels.

However, conservationists caution that challenges remain. Climate change is forcing snow leopards to higher elevations, reducing available habitat. Some regions, particularly in Central Asian republics, continue to see population declines due to insufficient protection and ongoing poaching for the illegal wildlife trade.

The success story has prompted calls for similar comprehensive surveys of other endangered mountain species. The methodology developed for tracking snow leopards is now being adapted to study other elusive species including the Himalayan wolf and red panda.

International funding for snow leopard conservation has been secured through 2030, ensuring continued protection efforts. Plans include expanding community-based conservation programs and establishing additional wildlife corridors to connect isolated populations and increase genetic diversity.`,
                categories: ['Wildlife', 'Conservation', 'Nature'],
                category: 'Wildlife',
                verified: true,
                trending: false,
                votes: 1567,
                readTime: 5,
            },
        ];
        
        return {
            data: allNews,
            page,
            totalPages: 3,
            hasMore: page < 3,
        };
    },
    
    voteArticle: async (articleId, voteType) => {
        await mockApi.delay(300);
        return { success: true, articleId, voteType };
    },
    
    bookmarkArticle: async (articleId) => {
        await mockApi.delay(300);
        return { success: true, articleId };
    },
};