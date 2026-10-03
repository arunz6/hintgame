import Team from "../model/user.schema.js";
import TeamRoute from "../model/questions.schema.js";

function validateLevels(levels) {
	if (!Array.isArray(levels) || levels.length !== 4) {
		return "Exactly four levels are required.";
	}

	const orderedLevels = [...levels].sort((a, b) => a?.level - b?.level);
	for (let index = 0; index < orderedLevels.length; index += 1) {
		const level = orderedLevels[index];
		if (
			!level ||
			level.level !== index + 1 ||
			typeof level.question !== "string" ||
			!level.question.trim() ||
			!Array.isArray(level.options) ||
			level.options.length < 2 ||
			level.options.length > 4 ||
			level.options.some((option) => typeof option !== "string" || !option.trim()) ||
			!Number.isInteger(level.correctIndex) ||
			level.correctIndex < 0 ||
			level.correctIndex >= level.options.length ||
			typeof level.clue !== "string" ||
			!level.clue.trim() ||
			typeof level.code !== "string" ||
			!level.code.trim() ||
			(level.location !== undefined && typeof level.location !== "string")
		) {
			return `Level ${index + 1} has invalid or missing question, options, correctIndex, clue, code, or location.`;
		}
	}

	const codes = orderedLevels.map((level) => level.code.trim().toUpperCase());
	if (new Set(codes).size !== codes.length) {
		return "Each level must have a different code.";
	}

	return null;
}

export async function addTeamQuestions(req, res) {
	try {
		const { teamCode, levels } = req.body ?? {};
		if (typeof teamCode !== "string" || !teamCode.trim()) {
			return res.status(400).json({ message: "teamCode is required." });
		}

		const validationError = validateLevels(levels);
		if (validationError) {
			return res.status(400).json({ message: validationError });
		}

		const team = await Team.findOne({ teamCode: teamCode.trim().toUpperCase() }).select("_id");
		if (!team) {
			return res.status(404).json({ message: "Team not found." });
		}

		const normalizedLevels = levels.map((level) => ({
			level: level.level,
			question: level.question.trim(),
			options: level.options.map((option) => option.trim()),
			correctIndex: level.correctIndex,
			clue: level.clue.trim(),
			code: level.code.trim().toUpperCase(),
			...(typeof level.location === "string" && level.location.trim()
				? { location: level.location.trim() }
				: {}),
		}));

		const teamRoute = await TeamRoute.findOne({ team: team._id });
		const routeToSave = teamRoute ?? new TeamRoute({ team: team._id });
		routeToSave.levels = normalizedLevels;
		await routeToSave.save();

		return res.status(200).json({
			message: "All four levels saved for the team.",
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: "Team levels are already being configured." });
		}
		if (error.name === "ValidationError" || error.name === "CastError") {
			return res.status(400).json({ message: error.message });
		}
		console.error("Saving team questions failed:", error);
		return res.status(500).json({ message: "Could not save team questions." });
	}
}