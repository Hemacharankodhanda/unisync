// Rich mock datasets for UniSync Pro Max to provide immediate interactivity and visual wow-factor

export const initialProfile = {
  id: "u_1",
  name: "Alex Rivera",
  email: "alex.rivera@unisync.edu",
  major: "Computer Science & AI",
  year: "Senior (Class of '27)",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  streak: 12,
  energyLevel: "Energized" // Energized | Balanced | Tired
};

export const initialLostItems = [
  {
    id: "l_1",
    title: "MacBook Pro 16\" Space Gray",
    category: "Electronics",
    location: "Science Library, 3rd Floor Quiet Zone",
    date: "10 mins ago",
    status: "Lost", // Lost | Found | Claimed
    description: "Has a GitHub and Rust sticker on the top cover. Serial number ends in 89X. Extremely important course notes inside!",
    contact: "alex.rivera@unisync.edu",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    reward: "$50 Reward",
    tags: ["Laptop", "Apple", "Stickers"]
  },
  {
    id: "l_2",
    title: "HydroFlask 32oz Matte Black",
    category: "Accessories",
    location: "Student Union Cafeteria (Near Subway)",
    date: "1 hour ago",
    status: "Found",
    description: "Found left on table 12 near the south entrance. Turned into the Student Union Information Desk.",
    contact: "union-desk@unisync.edu",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    reward: null,
    tags: ["Water Bottle", "Black", "Found"]
  },
  {
    id: "l_3",
    title: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    location: "Engineering Lab Room 402",
    date: "3 hours ago",
    status: "Lost",
    description: "Silver/Cream color in original carrying case with USB-C cable. Left after AI lecture at 2 PM.",
    contact: "m.chen@unisync.edu",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    reward: "$30 Reward",
    tags: ["Audio", "Sony", "Silver"]
  },
  {
    id: "l_4",
    title: "Calculus Early Transcendentals (9th Ed)",
    category: "Books",
    location: "North Campus Bus Stop #4",
    date: "Yesterday",
    status: "Found",
    description: "Hardcover textbook found on the bench. Name 'David K.' written on the inside cover.",
    contact: "campus-security@unisync.edu",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    reward: null,
    tags: ["Textbook", "Math", "Found"]
  },
  {
    id: "l_5",
    title: "Campus Student ID & Dorm Keycard",
    category: "ID Cards",
    location: "Recreation Fitness Center Locker Room",
    date: "2 days ago",
    status: "Claimed",
    description: "Belonged to Sarah Jenkins. Item has been successfully matched and returned to owner!",
    contact: "resolved",
    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80",
    reward: null,
    tags: ["ID Card", "Keys", "Resolved"]
  }
];

export const initialFoodItems = [
  {
    id: "f_1",
    title: "Artisanal Spicy Tuna Poke Bowl",
    cafeteria: "Main Campus Dining Hall",
    venue: "Pacific Rim Station",
    status: "In Stock", // In Stock | Running Low | Sold Out
    crowdLevel: "Moderate", // Quiet | Moderate | Busy
    calories: "620 kcal",
    price: "$9.50",
    dietary: ["High Protein 💪", "Pescatarian 🐟", "Gluten-Free 🌾"],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    upvotes: 42,
    downvotes: 2,
    lastUpdated: "5 mins ago"
  },
  {
    id: "f_2",
    title: "Crispy Avocado & Black Bean Tacos",
    cafeteria: "West Campus Student Center",
    venue: "Verde Cantina",
    status: "Running Low",
    crowdLevel: "Busy",
    calories: "510 kcal",
    price: "$7.25",
    dietary: ["Vegan 🌱", "Dairy-Free 🥛"],
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    upvotes: 89,
    downvotes: 5,
    lastUpdated: "Just now"
  },
  {
    id: "f_3",
    title: "Wood-Fired Truffle & Mushroom Pizza",
    cafeteria: "North Piazza Bistro",
    venue: "Little Italy Oven",
    status: "Sold Out",
    crowdLevel: "Busy",
    calories: "780 kcal",
    price: "$11.00",
    dietary: ["Vegetarian 🧀", "Halal 🥩"],
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    upvotes: 156,
    downvotes: 14,
    lastUpdated: "12 mins ago"
  },
  {
    id: "f_4",
    title: "Matcha Green Tea Acai Power Bowl",
    cafeteria: "Recreation Center Juice Bar",
    venue: "Zenith Smoothies",
    status: "In Stock",
    crowdLevel: "Quiet",
    calories: "420 kcal",
    price: "$8.50",
    dietary: ["Vegan 🌱", "Gluten-Free 🌾", "Organic 🌿"],
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80",
    upvotes: 34,
    downvotes: 0,
    lastUpdated: "25 mins ago"
  },
  {
    id: "f_5",
    title: "Grilled Chicken & Quinoa Mediterranean Salad",
    cafeteria: "Main Campus Dining Hall",
    venue: "Green Leaf Deli",
    status: "In Stock",
    crowdLevel: "Moderate",
    calories: "540 kcal",
    price: "$8.75",
    dietary: ["High Protein 💪", "Halal 🥩", "Low Carb 🥗"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    upvotes: 61,
    downvotes: 1,
    lastUpdated: "18 mins ago"
  }
];

export const initialStudyGroups = [
  {
    id: "s_1",
    courseCode: "CS 301",
    courseName: "Advanced Data Structures & Algorithms",
    topic: "Dynamic Programming & Graph Traversal Prep for Midterm",
    location: "Science Library, Group Study Room 4B",
    type: "In-Person", // In-Person | Virtual | Hybrid
    date: "Today, 6:00 PM - 8:30 PM",
    host: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    members: [
      { id: "m1", name: "Marcus", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" },
      { id: "m2", name: "Chloe", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
      { id: "m3", name: "Liam", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" }
    ],
    maxMembers: 6,
    resourcesLink: "https://github.com/unisync-cs301-notes",
    joined: false
  },
  {
    id: "s_2",
    courseCode: "AI 402",
    courseName: "Deep Learning & Neural Networks",
    topic: "PyTorch Transformer Architecture Implementation",
    location: "Virtual Discord Server #AI-Study",
    type: "Virtual",
    date: "Tomorrow, 4:00 PM - 6:00 PM",
    host: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    },
    members: [
      { id: "m4", name: "Elena", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" },
      { id: "m5", name: "Alex", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" },
      { id: "m6", name: "David", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" },
      { id: "m7", name: "Priya", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" }
    ],
    maxMembers: 5,
    resourcesLink: "https://colab.research.google.com/drive/example",
    joined: true
  },
  {
    id: "s_3",
    courseCode: "MATH 204",
    courseName: "Linear Algebra & Matrix Theory",
    topic: "Eigenvalues, Eigenvectors & SVD Decomposition",
    location: "Student Center Coffee Lounge",
    type: "Hybrid",
    date: "Thursday, 3:00 PM - 5:00 PM",
    host: {
      name: "Samuel Kim",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
    },
    members: [
      { id: "m8", name: "Samuel", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" },
      { id: "m9", name: "Jessica", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" }
    ],
    maxMembers: 8,
    resourcesLink: "https://notion.so/math204-cheatsheet",
    joined: false
  },
  {
    id: "s_4",
    courseCode: "BIO 101",
    courseName: "Cellular Biology & Genetics",
    topic: "DNA Replication & Mitosis Lab Review",
    location: "Life Sciences Building Rm 108",
    type: "In-Person",
    date: "Friday, 1:30 PM - 3:30 PM",
    host: {
      name: "Hannah Abbott",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    members: [
      { id: "m10", name: "Hannah", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" }
    ],
    maxMembers: 4,
    resourcesLink: "https://drive.google.com/bio101-slides",
    joined: false
  }
];

export const initialCampusFeed = [
  {
    id: "c_1",
    author: {
      name: "UniSync Campus Council",
      role: "Official Announcement",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80",
      verified: true
    },
    time: "45 mins ago",
    category: "Campus Pulse 📢",
    content: "🚀 Welcome to the all-new UniSync Pro Max! Experience our ultra-fast React app with live cafeteria tracking, AI-powered BrainBrew focus sessions, and smart study group matching. Explore the tabs and leave your feedback below!",
    likes: 124,
    comments: 18,
    likedByMe: false,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "c_2",
    author: {
      name: "AI & Robotics Club",
      role: "Student Organization",
      avatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=150&q=80",
      verified: true
    },
    time: "2 hours ago",
    category: "Hackathon 💻",
    content: "⚡ Annual Spring Hackathon registration is now LIVE! Build autonomous agents, computer vision models, or full-stack web apps over 36 hours. Free pizza, Red Bull, and over $10,000 in cash prizes! Who is looking for a teammate?",
    likes: 89,
    comments: 34,
    likedByMe: true,
    image: null
  },
  {
    id: "c_3",
    author: {
      name: "Maya Lin",
      role: "Sophomore Architecture",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      verified: false
    },
    time: "4 hours ago",
    category: "Study Tip 🧠",
    content: "Just tried the 'Lo-Fi Rain' background audio in BrainBrew while working on my CAD renderings. Literal game changer! Focused for 2 straight hours without touching my phone. 🌧️🎧",
    likes: 56,
    comments: 7,
    likedByMe: false,
    image: null
  }
];

export const ambientSoundscapes = [
  { id: "lofi", name: "Lo-Fi Study Beats 🎧", icon: "Headphones", desc: "Relaxed synth chillhop chords for deep coding" },
  { id: "rain", name: "Gentle Rainstorm 🌧️", icon: "CloudRain", desc: "Soothing raindrops against window panes" },
  { id: "library", name: "Quiet Library Whispers 📖", icon: "BookOpen", desc: "Subtle page turning and soft ambient acoustics" },
  { id: "cafe", name: "Cozy Campus Cafe ☕", icon: "Coffee", desc: "Warm coffee machine hum and distant chatter" },
  { id: "fire", name: "Crackling Fireplace 🔥", icon: "Flame", desc: "Cozy wood burning campfire crackles" }
];
