import jwt from "jsonwebtoken";
import Team from "../model/user.schema.js";

export async function requireAuth(req, res, next) {
	const authorization = req.get("authorization");
	const [scheme, token] = authorization?.split(" ") ?? [];
	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({ message: "Authentication required." });
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error("Authentication failed: JWT_SECRET is not configured.");
		return res.status(500).json({ message: "Authentication is not configured." });
	}

	let payload;
	try {
		payload = jwt.verify(token, secret);
	} catch {
		return res.status(401).json({ message: "Invalid or expired token." });
	}

	if (
		typeof payload !== "object" ||
		typeof payload.id !== "string" ||
		typeof payload.sid !== "string"
	) {
		return res.status(401).json({ message: "Invalid or expired token." });
	}

	const team = await Team.findOne({
		_id: payload.id,
		activeSessionId: payload.sid,
	});
	if (!team) {
		return res.status(401).json({ message: "This team session is no longer active." });
	}

	req.team = team;
	return next();
}

export function requireAdmin(req, res, next) {
	if (req.team?.role !== "admin") {
		return res.status(403).json({ message: "Admin access required." });
	}

	return next();
}
