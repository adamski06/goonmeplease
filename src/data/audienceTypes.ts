// 300 comprehensive audience types for targeting
export const AUDIENCE_TYPES = [
  // Demographics & Life Stages
  'Students', 'College Students', 'High School Students', 'Graduate Students', 'PhD Students',
  'Young Professionals', 'Mid-Career Professionals', 'Senior Professionals', 'Executives', 'C-Suite',
  'Parents', 'New Parents', 'Single Parents', 'Empty Nesters', 'Grandparents',
  'Millennials', 'Gen Z', 'Gen X', 'Baby Boomers', 'Gen Alpha Parents',
  'Singles', 'Couples', 'Newlyweds', 'Engaged Couples', 'Families',
  'Retirees', 'Pre-Retirees', 'Working Mothers', 'Stay-at-Home Parents', 'Working Fathers',
  
  // Technology & Gaming
  'Tech Enthusiasts', 'Gamers', 'PC Gamers', 'Console Gamers', 'Mobile Gamers',
  'Esports Fans', 'Streamers', 'Content Creators', 'Podcasters', 'YouTubers',
  'Early Adopters', 'Gadget Lovers', 'Smart Home Enthusiasts', 'VR/AR Users', 'AI Enthusiasts',
  'Programmers', 'Developers', 'Data Scientists', 'IT Professionals', 'Cybersecurity Experts',
  'Crypto Enthusiasts', 'NFT Collectors', 'Web3 Users', 'Fintech Users', 'App Developers',
  
  // Health & Fitness
  'Fitness Enthusiasts', 'Gym Goers', 'Runners', 'Cyclists', 'Swimmers',
  'Yoga Practitioners', 'Pilates Enthusiasts', 'CrossFit Athletes', 'Bodybuilders', 'Weightlifters',
  'Marathon Runners', 'Triathletes', 'Home Workout Fans', 'Personal Training Clients', 'Athletes',
  'Health-Conscious', 'Wellness Seekers', 'Mental Health Advocates', 'Meditation Practitioners', 'Mindfulness Enthusiasts',
  'Nutritionists', 'Diet-Conscious', 'Keto Followers', 'Vegan Athletes', 'Clean Eaters',
  
  // Fashion & Beauty
  'Fashion Lovers', 'Streetwear Fans', 'Luxury Fashion Buyers', 'Vintage Collectors', 'Sustainable Fashion Advocates',
  'Beauty Enthusiasts', 'Makeup Artists', 'Skincare Obsessed', 'Haircare Enthusiasts', 'Nail Art Fans',
  'Influencer Followers', 'Trend Setters', 'Minimalist Dressers', 'Plus Size Fashion', 'Petite Fashion',
  'Menswear Enthusiasts', 'Sneakerheads', 'Watch Collectors', 'Jewelry Lovers', 'Accessory Collectors',
  'Athleisure Wearers', 'Workwear Shoppers', 'Occasion Shoppers', 'Bridal', 'Maternity',
  
  // Food & Beverage
  'Foodies', 'Home Cooks', 'Professional Chefs', 'Bakers', 'Grill Masters',
  'Wine Enthusiasts', 'Beer Lovers', 'Cocktail Enthusiasts', 'Coffee Lovers', 'Tea Enthusiasts',
  'Vegans', 'Vegetarians', 'Plant-Based Eaters', 'Flexitarians', 'Pescatarians',
  'Organic Food Buyers', 'Farm-to-Table Advocates', 'Local Food Supporters', 'Food Allergy Aware', 'Gluten-Free',
  'Restaurant Goers', 'Food Delivery Users', 'Meal Kit Subscribers', 'Snack Lovers', 'Dessert Lovers',
  
  // Travel & Leisure
  'Travelers', 'Adventure Travelers', 'Luxury Travelers', 'Budget Travelers', 'Backpackers',
  'Digital Nomads', 'Business Travelers', 'Family Vacationers', 'Solo Travelers', 'Couples Travelers',
  'Beach Lovers', 'Mountain Enthusiasts', 'City Explorers', 'Cultural Tourists', 'Eco-Tourists',
  'Cruise Enthusiasts', 'Road Trippers', 'Camping Enthusiasts', 'Glamping Fans', 'RV Travelers',
  'Frequent Flyers', 'Points Collectors', 'Travel Hackers', 'Staycationers', 'Weekend Warriors',
  
  // Business & Professional
  'Entrepreneurs', 'Startup Founders', 'Small Business Owners', 'Freelancers', 'Solopreneurs',
  'Side Hustlers', 'Consultants', 'Coaches', 'Mentors', 'Investors',
  'Real Estate Investors', 'Stock Traders', 'Angel Investors', 'VC Networkers', 'Financial Advisors',
  'HR Professionals', 'Marketers', 'Sales Professionals', 'Account Managers', 'Project Managers',
  'Remote Workers', 'Hybrid Workers', 'Office Workers', 'Blue Collar Workers', 'Healthcare Workers',
  
  // Creative & Arts
  'Artists/Creatives', 'Graphic Designers', 'UI/UX Designers', 'Photographers', 'Videographers',
  'Illustrators', 'Animators', '3D Artists', 'Motion Designers', 'Product Designers',
  'Writers', 'Authors', 'Bloggers', 'Journalists', 'Copywriters',
  'Musicians', 'Music Producers', 'DJs', 'Singers', 'Instrumentalists',
  'Filmmakers', 'Directors', 'Actors', 'Voice Actors', 'Theater Enthusiasts',
  
  // Music & Entertainment
  'Music Lovers', 'Concert Goers', 'Festival Attendees', 'Vinyl Collectors', 'Playlist Curators',
  'Hip Hop Fans', 'Rock Fans', 'Pop Music Fans', 'Electronic Music Fans', 'Country Music Fans',
  'Classical Music Lovers', 'Jazz Enthusiasts', 'R&B Fans', 'Indie Music Fans', 'K-Pop Fans',
  'Movie Buffs', 'TV Series Binge Watchers', 'Documentary Lovers', 'Anime Fans', 'Manga Readers',
  'Podcast Listeners', 'Audiobook Listeners', 'True Crime Fans', 'Comedy Fans', 'Horror Fans',
  
  // Sports & Outdoors
  'Sports Fans', 'Soccer Fans', 'Basketball Fans', 'Football Fans', 'Baseball Fans',
  'Hockey Fans', 'Tennis Fans', 'Golf Enthusiasts', 'Motorsport Fans', 'Combat Sports Fans',
  'Fantasy Sports Players', 'Sports Bettors', 'Sports Card Collectors', 'Memorabilia Collectors', 'Stadium Goers',
  'Outdoor Enthusiasts', 'Hikers', 'Rock Climbers', 'Skiers', 'Snowboarders',
  'Surfers', 'Kayakers', 'Fishing Enthusiasts', 'Hunters', 'Bird Watchers',
  
  // Home & Lifestyle
  'Homeowners', 'Renters', 'First-Time Home Buyers', 'Real Estate Enthusiasts', 'Property Investors',
  'Interior Design Fans', 'Home Decorators', 'DIY Enthusiasts', 'Home Improvement', 'Renovation Fans',
  'Gardeners', 'Plant Parents', 'Urban Gardeners', 'Landscaping Enthusiasts', 'Sustainable Living',
  'Pet Owners', 'Dog Owners', 'Cat Owners', 'Pet Parents', 'Exotic Pet Owners',
  'Minimalists', 'Maximalists', 'Organization Fans', 'Marie Kondo Followers', 'Smart Home Owners',
  
  // Sustainability & Values
  'Eco-Conscious', 'Environmental Activists', 'Climate Advocates', 'Zero Waste', 'Sustainable Shoppers',
  'Ethical Consumers', 'Fair Trade Supporters', 'Animal Rights Advocates', 'Vegan Lifestyle', 'Cruelty-Free Shoppers',
  'Social Impact Investors', 'Philanthropists', 'Volunteers', 'Non-Profit Supporters', 'Community Activists',
  'LGBTQ+ Community', 'Allies', 'Diversity Advocates', 'Women Empowerment', 'Social Justice Advocates',
  
  // Luxury & Premium
  'Luxury Seekers', 'High Net Worth', 'Affluent Shoppers', 'Premium Brand Loyalists', 'Exclusive Experience Seekers',
  'Fine Dining Enthusiasts', 'Art Collectors', 'Antique Collectors', 'Rare Item Collectors', 'Auction Bidders',
  'Private Jet Travelers', 'Yacht Enthusiasts', 'Exotic Car Collectors', 'Luxury Watch Collectors', 'Fine Jewelry Buyers',
  
  // Education & Learning
  'Lifelong Learners', 'Online Course Takers', 'Skill Seekers', 'Career Changers', 'Certification Seekers',
  'Book Lovers', 'Avid Readers', 'Non-Fiction Readers', 'Fiction Readers', 'Self-Help Readers',
  'Language Learners', 'STEM Enthusiasts', 'History Buffs', 'Science Enthusiasts', 'Philosophy Readers',
  
  // Finance & Investing
  'Budget Conscious', 'Savers', 'Frugal Shoppers', 'Coupon Users', 'Deal Hunters',
  'Investors', 'Day Traders', 'Long-Term Investors', 'Retirement Planners', 'Wealth Builders',
  'Debt-Free Journey', 'Financial Independence', 'FIRE Movement', 'Side Income Seekers', 'Passive Income Builders'
];

// For quick lookup
export const AUDIENCE_TYPES_SET = new Set(AUDIENCE_TYPES);
