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

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	console.log({ isAdmin });
	const { coin } = useMusicStore();
	const [isPrem, setIsPrem] = useState<boolean>(false)
	useEffect(() => {
		const isPrem = localStorage.getItem("isprem")
		if (isPrem) {
			setIsPrem(true)
		} else {
			setIsPrem(false)
		}
	}, [])


	const loadRazorpayScript = () => {
		return new Promise((resolve) => {
			if (window.Razorpay) {
				resolve(true);
				return;
			}

			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.async = true;
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const handdlePayment = async () => {
		try {
			const isLoaded = await loadRazorpayScript();
			if (!isLoaded) {
				alert("Failed to load Razorpay. Please try again.");
				return;
			}

			const orderData = await axios.post("http://localhost:5000/create-order");
			const order = orderData.data;

			const options = {
				key: "rzp_test_cMQQFYPaYpEzfm", // Replace with actual Razorpay Key ID
				amount: order.amount,
				currency: order.currency,
				name: "Your Company",
				description: "Test Transaction",
				order_id: order.id,
				handler: async () => {
					localStorage.setItem("isprem", "true")
					setIsPrem(true);
					alert("Payment successful!");
				},


				prefill: {
					name: "John Doe",
					email: "johndoe@example.com",
					contact: "9999999999",
				},

				theme: {
					color: "#3399cc",
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				Spotify
			</div>
			<div className='flex items-center gap-4'>
				{isAdmin ? (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Admin Dashboard
					</Link>
				) :
					!isPrem ?
						<>
							<button className="outline px-3 py-1 outline-2 rounded-xl" onClick={handdlePayment}>
								Buy Premium
							</button>
						</> : <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-md">
							Premium
						</span>

				}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>


				<div className="flex gap-2 mr-3">
					<Coins color="yellow" />
					<span>
						{coin}
					</span>
				</div>
				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;
