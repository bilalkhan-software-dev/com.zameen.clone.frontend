# PropertyHub Frontend – Next.js + MUI + TypeScript

> **Internship Project** – A modern real‑estate portal built with Next.js 16.2.6 (App Router), React 19, Material‑UI, and TypeScript.

## ✨ Features

- **Property search** with advanced filtering, pagination, and sorting
- **Property detail page** with image slider, interactive map, mortgage calculator, price trends, and trending locations
- **Role‑based dashboards** for Agents and Admins
- **Enquiry system** – public send, agent/admin view and delete
- **Loan application** modal integrated with the enquiry backend
- **Price trend charts** (historical data & monthly auto‑generation)
- **Trending locations** chart (based on search logs)
- **Fully responsive** design (mobile, tablet, desktop)
- **Global settings** – currency and area unit persisted in localStorage
- **JWT authentication** with refresh token rotation

## 🛠 Tech Stack

- Next.js 16.2.6 (App Router)
- React 19.2.4
- Material‑UI (MUI) 9.0.1
- TypeScript
- Axios, Chart.js, Google Maps (vis.gl)

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- The backend API must be running (see backend README)

### 1. Clone the repository

```bash
git clone https://github.com/bilalkhan-software-dev/com.zameen.clone.frontend.git
cd com.zameen.clone.frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root (copy from `.env.example` if available). The essential variables are:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5118/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id
```

> If you don’t have Google Maps keys, the map will still render but in a degraded mode.

### 4. Run the development server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure (simplified)

```
src/
├── app/                  # Next.js App Router pages
│   ├── properties/       # Property list & detail pages
│   ├── dashboard/        # Admin & Agent dashboards
│   └── ...               # Other routes
├── components/           # Reusable components (Navbar, PropertyCard, etc.)
├── context/              # React contexts (Auth, Settings)
├── hooks/                # Custom hooks (useProperties, useDebounce)
├── lib/                  # Axios instance, types
└── utils/                # Helper functions
```

## 🎨 Theming

The project uses MUI with a custom green‑and‑white theme inspired by Zameen.com. You can adjust the theme in `src/theme.ts`.

## 🌐 API Integration

All API calls are made using Axios. The base URL is set in the environment variable `NEXT_PUBLIC_API_BASE_URL`. The Axios instance automatically handles JWT token attachment and refresh.


## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.
```

---