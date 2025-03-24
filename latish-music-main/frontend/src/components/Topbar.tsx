import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const moods = ["Relaxing", "Energetic", "Romantic", "Sad", "Happy", "All"];

// Define theme colors for each mood
const moodColors: { [key: string]: string } = {
  Relaxing: "#4A90E2", // Blue
  Energetic: "#E74C3C", // Red
  Romantic: "#FF69B4", // Pink
  Sad: "#2C3E50", // Dark Blue
  Happy: "#F1C40F", // Yellow
};

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Topbar = () => {
  const { isAdmin } = useAuthStore();
  const { coin, fetchMadeForYouSongs } = useMusicStore();
  const [isPrem, setIsPrem] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const isPrem = localStorage.getItem("isprem");
    setIsPrem(isPrem ? true : false);

    const savedMood = localStorage.getItem("selectedMood");
    if (savedMood) {
      setSelectedMood(savedMood);
    }
  }, []);

  const handleMoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mood = event.target.value;
    setSelectedMood(mood);
    fetchMadeForYouSongs(mood);
    localStorage.setItem("selectedMood", mood);
  };

  const themeColor = selectedMood ? moodColors[selectedMood] : "#000";

  const handlePayment = async () => {
    alert("Buy Premium 3 Months Plan");
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert("Failed to load Razorpay. Check your internet and try again.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK is not available. Please refresh and try again.");
      return;
    }

    try {
      const { data: order } = await axios.post("http://localhost:5000/create-order");

      const options = {
        key: "rzp_test_cMQQFYPaYpEzfm",
        amount: order.amount,
        currency: order.currency,
        name: "Melody Sphere",
        description: "Subscription: MelodySphere Premium",
        order_id: order.id,
        handler: () => {
          localStorage.setItem("isprem", "true");
          setIsPrem(true);
          alert("Payment successful!");
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: { color: themeColor },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment could not be processed. Please try again.");
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 sticky top-0 backdrop-blur-md z-10"
      style={{ backgroundColor: themeColor }}
    >
      <div className="flex gap-2 items-center">
        <img
          src="/melody.jpg"
          className="size-8 border-2 rounded-full"
          alt="Melody logo"
        />
        Melody Sphere
      </div>
      <div className="flex items-center gap-4">
        <select
          value={selectedMood || ""}
          onChange={handleMoodChange}
          className="px-3 py-1 rounded-md bg-gray-800 text-white"
        >
          <option value="" disabled>
            Select Mood
          </option>
          {moods.map((mood) => (
            <option key={mood} value={mood !== "All" ? mood : ""}>
              {mood}
            </option>
          ))}
        </select>

        {isAdmin ? (
          <Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        ) : !isPrem ? (
          <button className="outline px-3 py-1 outline-2 rounded-xl" onClick={handlePayment}>
            Buy Premium
          </button>
        ) : (
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-md">
            Premium
          </span>
        )}

        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>

        <div className="flex gap-2 mr-3">
          <Coins color="yellow" />
          <span>{coin}</span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Topbar;
