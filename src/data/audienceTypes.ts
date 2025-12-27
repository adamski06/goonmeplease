// 300 comprehensive audience types for targeting
export const AUDIENCE_TYPES = [
  // Demographics & Life Stages
  'Students', 'College Students', 'High School Students', 'Graduate Students', 'PhD Students',
  'Young Professionals', 'Mid-Career Professionals', 'Senior Professionals', 'Executives', 'C-Suite',
  'Parents', 'New Parents', 'Single Parents', 'Empty Nesters', 'Grandparents',
  'Millennials', 'Gen Z', 'Gen X', 'Baby Boomers', 'Gen Alpha Parents',
  'Singles', 'Couples', 'Newlyweds', 'Engaged Couples', 'Families',
  'Retirees', 'Pre-Retirees', 'Working Mothers', 'Stay-at-Home Parents', 'Working Fathers',
  'First-Time Moms', 'Teen Parents', 'Adoptive Parents', 'Foster Parents', 'Expecting Parents',
  
  // Technology & Gaming
  'Tech Enthusiasts', 'Gamers', 'PC Gamers', 'Console Gamers', 'Mobile Gamers',
  'Esports Fans', 'Streamers', 'Content Creators', 'Podcasters', 'YouTubers',
  'Early Adopters', 'Gadget Lovers', 'Smart Home Enthusiasts', 'VR/AR Users', 'AI Enthusiasts',
  'Programmers', 'Developers', 'Data Scientists', 'IT Professionals', 'Cybersecurity Experts',
  'Crypto Enthusiasts', 'NFT Collectors', 'Web3 Users', 'Fintech Users', 'App Developers',
  'TikTokers', 'Instagram Creators', 'Twitch Streamers', 'Discord Users', 'Reddit Users',
  'Tech Reviewers', 'Beta Testers', 'Open Source Contributors', 'Hackathon Participants', 'Code Bootcamp Students',
  
  // Health & Fitness
  'Fitness Enthusiasts', 'Gym Goers', 'Runners', 'Cyclists', 'Swimmers',
  'Yoga Practitioners', 'Pilates Enthusiasts', 'CrossFit Athletes', 'Bodybuilders', 'Weightlifters',
  'Marathon Runners', 'Triathletes', 'Home Workout Fans', 'Personal Training Clients', 'Athletes',
  'Health-Conscious', 'Wellness Seekers', 'Mental Health Advocates', 'Meditation Practitioners', 'Mindfulness Enthusiasts',
  'Nutritionists', 'Diet-Conscious', 'Keto Followers', 'Vegan Athletes', 'Clean Eaters',
  'Biohackers', 'Sleep Optimizers', 'Supplement Users', 'Functional Fitness', 'HIIT Enthusiasts',
  'Martial Arts Practitioners', 'Boxing Enthusiasts', 'Dance Fitness Fans', 'Spin Class Devotees', 'Barre Enthusiasts',
  'Recovery Focused', 'Physical Therapy Patients', 'Chronic Pain Sufferers', 'Mobility Focused', 'Senior Fitness',
  
  // Fashion & Beauty
  'Fashion Lovers', 'Streetwear Fans', 'Luxury Fashion Buyers', 'Vintage Collectors', 'Sustainable Fashion Advocates',
  'Beauty Enthusiasts', 'Makeup Artists', 'Skincare Obsessed', 'Haircare Enthusiasts', 'Nail Art Fans',
  'Influencer Followers', 'Trend Setters', 'Minimalist Dressers', 'Plus Size Fashion', 'Petite Fashion',
  'Menswear Enthusiasts', 'Sneakerheads', 'Watch Collectors', 'Jewelry Lovers', 'Accessory Collectors',
  'Athleisure Wearers', 'Workwear Shoppers', 'Occasion Shoppers', 'Bridal', 'Maternity',
  'Thrift Shoppers', 'Designer Resale Buyers', 'Capsule Wardrobe Fans', 'Color Analysis Enthusiasts', 'Personal Stylists',
  'K-Beauty Fans', 'Clean Beauty Advocates', 'Anti-Aging Focused', 'Acne Fighters', 'Natural Beauty',
  'Fragrance Collectors', 'Grooming Enthusiasts', 'Beard Care', 'Hair Loss Solutions', 'Body Positivity Advocates',
  
  // Food & Beverage
  'Foodies', 'Home Cooks', 'Professional Chefs', 'Bakers', 'Grill Masters',
  'Wine Enthusiasts', 'Beer Lovers', 'Cocktail Enthusiasts', 'Coffee Lovers', 'Tea Enthusiasts',
  'Vegans', 'Vegetarians', 'Plant-Based Eaters', 'Flexitarians', 'Pescatarians',
  'Organic Food Buyers', 'Farm-to-Table Advocates', 'Local Food Supporters', 'Food Allergy Aware', 'Gluten-Free',
  'Restaurant Goers', 'Food Delivery Users', 'Meal Kit Subscribers', 'Snack Lovers', 'Dessert Lovers',
  'Specialty Coffee Drinkers', 'Craft Beer Enthusiasts', 'Natural Wine Lovers', 'Whiskey Collectors', 'Sake Enthusiasts',
  'Meal Preppers', 'Intermittent Fasters', 'Carnivore Diet', 'Paleo Followers', 'Whole30 Participants',
  'Food Photography', 'Recipe Creators', 'Cooking Show Watchers', 'Food Truck Fans', 'Street Food Lovers',
  
  // Travel & Leisure
  'Travelers', 'Adventure Travelers', 'Luxury Travelers', 'Budget Travelers', 'Backpackers',
  'Digital Nomads', 'Business Travelers', 'Family Vacationers', 'Solo Travelers', 'Couples Travelers',
  'Beach Lovers', 'Mountain Enthusiasts', 'City Explorers', 'Cultural Tourists', 'Eco-Tourists',
  'Cruise Enthusiasts', 'Road Trippers', 'Camping Enthusiasts', 'Glamping Fans', 'RV Travelers',
  'Frequent Flyers', 'Points Collectors', 'Travel Hackers', 'Staycationers', 'Weekend Warriors',
  'Hostel Travelers', 'Airbnb Enthusiasts', 'All-Inclusive Travelers', 'Resort Lovers', 'Boutique Hotel Fans',
  'Scuba Divers', 'Snorkeling Enthusiasts', 'Safari Goers', 'Northern Lights Chasers', 'National Park Visitors',
  'Food Tourists', 'Wine Country Travelers', 'Festival Travelers', 'Volunteer Travelers', 'Wellness Retreat Seekers',
  
  // Business & Professional
  'Entrepreneurs', 'Startup Founders', 'Small Business Owners', 'Freelancers', 'Solopreneurs',
  'Side Hustlers', 'Consultants', 'Coaches', 'Mentors', 'Investors',
  'Real Estate Investors', 'Stock Traders', 'Angel Investors', 'VC Networkers', 'Financial Advisors',
  'HR Professionals', 'Marketers', 'Sales Professionals', 'Account Managers', 'Project Managers',
  'Remote Workers', 'Hybrid Workers', 'Office Workers', 'Blue Collar Workers', 'Healthcare Workers',
  'E-commerce Sellers', 'Dropshippers', 'Amazon Sellers', 'Etsy Sellers', 'Shopify Merchants',
  'Agency Owners', 'SaaS Founders', 'Tech Startup Founders', 'Social Enterprise Founders', 'Non-Profit Leaders',
  'Career Advancers', 'Job Seekers', 'Career Switchers', 'MBA Students', 'Executive Coaches',
  
  // Creative & Arts
  'Artists/Creatives', 'Graphic Designers', 'UI/UX Designers', 'Photographers', 'Videographers',
  'Illustrators', 'Animators', '3D Artists', 'Motion Designers', 'Product Designers',
  'Writers', 'Authors', 'Bloggers', 'Journalists', 'Copywriters',
  'Musicians', 'Music Producers', 'DJs', 'Singers', 'Instrumentalists',
  'Filmmakers', 'Directors', 'Actors', 'Voice Actors', 'Theater Enthusiasts',
  'Calligraphers', 'Sculptors', 'Painters', 'Digital Artists', 'Mixed Media Artists',
  'Fashion Designers', 'Interior Designers', 'Architects', 'Industrial Designers', 'Jewelry Designers',
  'Poets', 'Screenwriters', 'Playwrights', 'Comic Artists', 'Storyboard Artists',
  
  // Music & Entertainment
  'Music Lovers', 'Concert Goers', 'Festival Attendees', 'Vinyl Collectors', 'Playlist Curators',
  'Hip Hop Fans', 'Rock Fans', 'Pop Music Fans', 'Electronic Music Fans', 'Country Music Fans',
  'Classical Music Lovers', 'Jazz Enthusiasts', 'R&B Fans', 'Indie Music Fans', 'K-Pop Fans',
  'Movie Buffs', 'TV Series Binge Watchers', 'Documentary Lovers', 'Anime Fans', 'Manga Readers',
  'Podcast Listeners', 'Audiobook Listeners', 'True Crime Fans', 'Comedy Fans', 'Horror Fans',
  'Theater Goers', 'Broadway Fans', 'Opera Enthusiasts', 'Ballet Fans', 'Stand-Up Comedy Fans',
  'Reality TV Watchers', 'Sports Broadcast Viewers', 'News Junkies', 'Late Night Show Fans', 'Award Show Watchers',
  'Board Game Enthusiasts', 'Card Game Players', 'Puzzle Lovers', 'Escape Room Fans', 'Trivia Enthusiasts',
  
  // Sports & Outdoors
  'Sports Fans', 'Soccer Fans', 'Basketball Fans', 'Football Fans', 'Baseball Fans',
  'Hockey Fans', 'Tennis Fans', 'Golf Enthusiasts', 'Motorsport Fans', 'Combat Sports Fans',
  'Fantasy Sports Players', 'Sports Bettors', 'Sports Card Collectors', 'Memorabilia Collectors', 'Stadium Goers',
  'Outdoor Enthusiasts', 'Hikers', 'Rock Climbers', 'Skiers', 'Snowboarders',
  'Surfers', 'Kayakers', 'Fishing Enthusiasts', 'Hunters', 'Bird Watchers',
  'Trail Runners', 'Mountain Bikers', 'BMX Riders', 'Skateboarding Enthusiasts', 'Rollerbladers',
  'Sailing Enthusiasts', 'Boating Fans', 'Jet Ski Riders', 'Wakeboarding Fans', 'Paddleboarding Enthusiasts',
  'Ultra Marathon Runners', 'Obstacle Course Racers', 'Adventure Racers', 'Parkour Enthusiasts', 'Free Runners',
  
  // Home & Lifestyle
  'Homeowners', 'Renters', 'First-Time Home Buyers', 'Real Estate Enthusiasts', 'Property Investors',
  'Interior Design Fans', 'Home Decorators', 'DIY Enthusiasts', 'Home Improvement', 'Renovation Fans',
  'Gardeners', 'Plant Parents', 'Urban Gardeners', 'Landscaping Enthusiasts', 'Sustainable Living',
  'Pet Owners', 'Dog Owners', 'Cat Owners', 'Pet Parents', 'Exotic Pet Owners',
  'Minimalists', 'Maximalists', 'Organization Fans', 'Marie Kondo Followers', 'Smart Home Owners',
  'Tiny Home Enthusiasts', 'Van Lifers', 'Apartment Dwellers', 'Condo Owners', 'Suburban Families',
  'Crafters', 'Knitters', 'Sewers', 'Woodworkers', 'Furniture Makers',
  'Candle Makers', 'Soap Makers', 'Home Brewers', 'Fermentation Hobbyists', 'Preserving Enthusiasts',
  
  // Sustainability & Values
  'Eco-Conscious', 'Environmental Activists', 'Climate Advocates', 'Zero Waste', 'Sustainable Shoppers',
  'Ethical Consumers', 'Fair Trade Supporters', 'Animal Rights Advocates', 'Vegan Lifestyle', 'Cruelty-Free Shoppers',
  'Social Impact Investors', 'Philanthropists', 'Volunteers', 'Non-Profit Supporters', 'Community Activists',
  'LGBTQ+ Community', 'Allies', 'Diversity Advocates', 'Women Empowerment', 'Social Justice Advocates',
  'Conscious Consumers', 'B-Corp Supporters', 'Local Business Supporters', 'Buy-Nothing Movement', 'Repair Culture',
  'Carbon Footprint Reducers', 'Electric Vehicle Owners', 'Solar Panel Owners', 'Composters', 'Recycling Advocates',
  
  // Luxury & Premium
  'Luxury Seekers', 'High Net Worth', 'Affluent Shoppers', 'Premium Brand Loyalists', 'Exclusive Experience Seekers',
  'Fine Dining Enthusiasts', 'Art Collectors', 'Antique Collectors', 'Rare Item Collectors', 'Auction Bidders',
  'Private Jet Travelers', 'Yacht Enthusiasts', 'Exotic Car Collectors', 'Luxury Watch Collectors', 'Fine Jewelry Buyers',
  'Country Club Members', 'Private Members Club', 'Concierge Service Users', 'Personal Shoppers', 'Luxury Real Estate',
  
  // Education & Learning
  'Lifelong Learners', 'Online Course Takers', 'Skill Seekers', 'Career Changers', 'Certification Seekers',
  'Book Lovers', 'Avid Readers', 'Non-Fiction Readers', 'Fiction Readers', 'Self-Help Readers',
  'Language Learners', 'STEM Enthusiasts', 'History Buffs', 'Science Enthusiasts', 'Philosophy Readers',
  'Homeschool Parents', 'Tutoring Seekers', 'Test Prep Students', 'Study Abroad Aspirants', 'Scholarship Seekers',
  'Professional Development', 'Leadership Learners', 'Public Speaking Learners', 'Networking Enthusiasts', 'Mastermind Members',
  
  // Finance & Investing
  'Budget Conscious', 'Savers', 'Frugal Shoppers', 'Coupon Users', 'Deal Hunters',
  'Investors', 'Day Traders', 'Long-Term Investors', 'Retirement Planners', 'Wealth Builders',
  'Debt-Free Journey', 'Financial Independence', 'FIRE Movement', 'Side Income Seekers', 'Passive Income Builders',
  'Credit Score Builders', 'First-Time Investors', 'Real Estate Flippers', 'Dividend Investors', 'Index Fund Investors',
  'Personal Finance Enthusiasts', 'Budgeting App Users', 'Financial Literacy Advocates', 'Money Coaches', 'Wealth Managers'
];

// For quick lookup
export const AUDIENCE_TYPES_SET = new Set(AUDIENCE_TYPES);
