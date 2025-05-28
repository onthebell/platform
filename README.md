# OnTheBell - Bellarine Peninsula Community Platform

OnTheBell is an open-source community platform designed specifically for
residents of the Bellarine Peninsula in Victoria, Australia. It serves as a
central hub for local information, community connections, and services.

## 🌟 Features

### Core Community Features

- **Local Events Calendar** - Discover and share community events
- **Interactive Map** - Find local businesses, events, and community spots using
  Leaflet
- **Marketplace** - Buy, sell, or give away items locally
- **Community Help Requests** - Ask for help or lend a hand to neighbors
- **Neighborhood Connections** - Meet and connect with people nearby
- **Local Deals & Discounts** - Exclusive offers from Bellarine businesses

### User Authentication & Verification

- **Firebase Authentication** - Secure user management
- **Address Verification System** - Verify residents for "On the Bell" access
- **Tiered Access Control** - Different features for verified vs. unverified
  users

### Additional Features

- **Video Content** - Mux integration for community videos
- **Donation System** - Support platform development via Stripe
- **Mobile-First Design** - Responsive design built with TailwindCSS

## 🛠 Tech Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: TailwindCSS
- **Authentication & Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe for donations
- **Maps**: Leaflet and React Leaflet
- **Media**: Mux for video components
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Firebase account and project
- Stripe account (for donations)
- Mux account (for video features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/onthebell/platform.git
   cd platform
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase, Stripe, and Mux configuration in `.env.local`

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config to `.env.local`

### Stripe Setup (Optional)

1. Create a Stripe account
2. Get your publishable and secret keys
3. Add them to `.env.local`

## 📋 API Keys Configuration

### Google Maps API

For the address autocomplete and map features to work properly, you need to set
up a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
5. Create an API key under "APIs & Services" > "Credentials"
6. Restrict the API key to the following:

   - HTTP referrers (websites): Add your domain (e.g., localhost:3000 for
     development)
   - API restrictions: Restrict to the three APIs mentioned above

7. Add the API key to your `.env.local` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

### Troubleshooting API Keys

If you see the error "ApiNotActivatedMapError":

1. Ensure you've enabled all required APIs (Maps JavaScript API, Places API,
   Geocoding API)
2. Check that billing is enabled for your Google Cloud project
3. Verify that your API key doesn't have overly restrictive usage limits
4. Make sure your domain is authorized in the API key restrictions

## 🔥 Firebase Configuration

1. **Firebase Console**: Go to the
   [Firebase Console](https://console.firebase.google.com/)
2. **Create a Project**: Click on "Add project" and follow the prompts
3. **Register App**: In your project overview, click on "Add app" and select
   your platform (Web)
4. **Firebase SDK**: Install Firebase SDK in your project
   ```bash
   pnpm install firebase
   ```
5. **Initialize Firebase**: Add Firebase initialization code in your project
6. **Enable Firestore**: In the Firebase Console, navigate to Firestore Database
   and click "Create database"
7. **Set Up Authentication**: Go to Authentication > Sign-in method and enable
   Email/Password
8. **Configure Storage**: Navigate to Storage and click "Get started" to enable
   Firebase Storage

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # Reusable React components
│   ├── auth/          # Authentication components
│   ├── community/     # Community features
│   ├── layout/        # Layout components
│   ├── map/           # Map components
│   └── ui/            # UI components
├── lib/               # Utility functions and configurations
│   ├── firebase/      # Firebase configuration
│   ├── stripe/        # Stripe configuration
│   └── utils/         # Utility functions
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

## 🎯 Community Guidelines

OnTheBell is built for the Bellarine Peninsula community with the following
principles:

1. **Local Focus** - Content should be relevant to Bellarine Peninsula residents
2. **Community Safety** - Address verification ensures local authenticity
3. **Helpful & Respectful** - Foster positive community connections
4. **Open Source** - Community-driven development and transparency

## 🤝 Contributing

We welcome contributions from the community! Please see our
[Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Support

If you find OnTheBell useful, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features
- 💖 Making a donation to support development
- 🤝 Contributing code or documentation

## 📧 Contact

- **Website**: [onthebell.com.au](https://onthebell.com.au)
- **Email**: hello@onthebell.com.au
- **GitHub**:
  [github.com/onthebell/platform](https://github.com/onthebell/platform)

---

Made with ❤️ for the Bellarine Peninsula community
