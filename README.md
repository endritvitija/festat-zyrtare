# Festat Zyrtare - Shqipëri & Kosovë 🇦🇱 🇽🇰

A modern, responsive web application that displays the official holidays for Albania and Kosovo for the year 2026. Built with Next.js and Tailwind CSS.

## 🚀 Features

- **Dual View Modes**:
  - **Calendar View**: A vertical, full-year scrolling calendar with clear holiday indicators.
  - **List View**: A clean, chronological list of holidays grouped by month.
- **Smart Filtering**: Filter holidays by country (Albania, Kosovo, or Both).
- **Modern UI/UX**:
  - Clean, minimalist design.
  - Dark mode support 🌙.
  - Smooth scrolling and animations.
  - Sticky filter bar for easy navigation.
  - Current day highlighting.
- **Responsive**: Fully optimized for mobile, tablet, and desktop devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

## 📂 Project Structure

```bash
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles & Tailwind configuration
│   ├── layout.tsx          # Root layout with ThemeProvider
│   └── page.tsx            # Main application page
├── components/             # React Components
│   ├── FilterBar.tsx       # Sticky filter & view switcher
│   ├── HolidayCalendar.tsx # Vertical calendar implementation
│   ├── HolidayList.tsx     # List view implementation
│   ├── ThemeToggle.tsx     # Dark/Light mode switch
│   └── providers/          # Context providers (ThemeProvider)
├── data/
│   └── holidays.ts         # Static holiday data for 2026
├── lib/
│   └── utils.ts            # Utility functions (cn class merger)
└── types/
    └── index.ts            # TypeScript interfaces (Holiday, Country)
```

## 🏃‍♂️ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/endritvitija/festat-zyrtare.git
    cd festat-zyrtare
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
