import express from "express";
import { Song } from "../models/song.model.js";

const router = express.Router();

// Get songs based on mood
router.get("/songs", async (req, res) => {
	try {
		const { mood } = req.query;

		if (!mood) {
			return res.status(400).json({ message: "Mood is required" });
		}

		const songs = await Song.find({ mood });

		if (!songs.length) {
			return res.status(404).json({ message: "No songs found for this mood" });
		}

		res.json(songs);
	} catch (error) {
		console.error("Error fetching songs by mood:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

export default router;
