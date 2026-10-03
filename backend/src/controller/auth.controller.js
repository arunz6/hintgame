import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import Team from "../model/user.schema.js";

const publicTeam = (team) => ({
	id: team._id,
	teamName: team.teamName,
	teamCode: team.teamCode,
	members: team.members,
	role: team.role,
	status: team.status,
	currentLevel: team.currentLevel,
	createdAt: team.createdAt,
});

export async function registerTeam(req, res) {
	try {
		const { teamName, teamCode, password, members } = req.body ?? {};

		if (
			typeof teamName !== "string" ||
			typeof teamCode !== "string" ||
			typeof password !== "string" ||
			!Array.isArray(members)
		) {
			return res.status(400).json({
				message: "teamName, teamCode, password, and members are required.",
			});
		}

		const normalizedMembers = members.map((member) => {
			if (typeof member === "string") return member.trim();
			return typeof member?.name === "string" ? member.name.trim() : "";
		});

		if (normalizedMembers.some((name) => !name)) {
			return res.status(400).json({ message: "Every team member needs a name." });
		}
		if (normalizedMembers.length < 2 || normalizedMembers.length > 5) {
			return res.status(400).json({ message: "A team must have 2 to 5 members." });
		}
		if (password.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters." });
		}

		const normalizedTeamName = teamName.trim();
		const normalizedTeamCode = teamCode.trim().toUpperCase();
		if (!normalizedTeamName || !normalizedTeamCode) {
			return res.status(400).json({ message: "Team name and team code cannot be empty." });
		}

		const existingTeam = await Team.findOne({
			$or: [{ teamName: normalizedTeamName }, { teamCode: normalizedTeamCode }],
		});
		if (existingTeam) {
			return res.status(409).json({ message: "Team name or team code is already registered." });
		}

		const team = await Team.create({
			teamName: normalizedTeamName,
			teamCode: normalizedTeamCode,
			password,
			members: normalizedMembers.map((name) => ({ name })),
		});

		return res.status(201).json({
			message: "Team registered successfully.",
			team: publicTeam(team),
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: "Team name or team code is already registered." });
		}
		if (error.name === "ValidationError") {
			return res.status(400).json({ message: error.message });
		}
		console.error("Team registration failed:", error);
		return res.status(500).json({ message: "Could not register team." });
	}
}

export async function loginTeam(req, res) {
	try {
		const { teamCode, teamName, password } = req.body ?? {};
		const loginCode = typeof teamCode === "string" ? teamCode.trim().toUpperCase() : "";
		const legacyTeamName = typeof teamName === "string" ? teamName.trim() : "";
		if ((!loginCode && !legacyTeamName) || typeof password !== "string") {
			return res.status(400).json({ message: "teamCode and password are required." });
		}
		if (!process.env.JWT_SECRET) {
			console.error("Team login failed: JWT_SECRET is not configured.");
			return res.status(500).json({ message: "Login is not configured." });
		}

		const team = await Team.findOne(
			loginCode ? { teamCode: loginCode } : { teamName: legacyTeamName },
		).select("+password");
		if (!team || !(await team.comparePassword(password))) {
			return res.status(401).json({ message: "Invalid team code or password." });
		}

		team.activeSessionId = randomUUID();
		await team.save();

		const token = jwt.sign(
			{ id: team._id.toString(), sid: team.activeSessionId },
			process.env.JWT_SECRET,
			{ expiresIn: "2d" },
		);

		return res.status(200).json({
			message: "Login successful.",
			token,
			team: publicTeam(team),
		});
	} catch (error) {
		console.error("Team login failed:", error);
		return res.status(500).json({ message: "Could not log in." });
	}
}
