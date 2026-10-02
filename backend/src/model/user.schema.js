import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const memberSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true } },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true, trim: true },
    teamCode: { type: String, required: true, unique: true, uppercase: true, trim: true }, // login ID, jaise "TEAM07"
    password: { type: String, required: true, select: false }, // bcrypt hash save hoga, query me default nahi aayega

    members: {
      type: [memberSchema],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 5,
        message: "Team me 2 se 5 members hone chahiye",
      },
    },

    // 1 time me 1 phone: nayi login par ye badal jati hai, purani session invalid
    activeSessionId: { type: String, default: null },

    // Game progress
    status: {
      type: String,
      enum: ["not_started", "playing", "finished"],
      default: "not_started",
    },
    currentLevel: { type: Number, default: 1, min: 1, max: 5 }, // 1-4 levels, 5 = final round
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null }, // Level 4 khatam hone ka server time
    penaltySeconds: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 }, // abhi use nahi, baad ke liye

    levelSolvedAt: [
      {
        _id: false,
        level: Number,
        at: Date,
      },
    ],
  },
  { timestamps: true }
);

// Password save hone se pehle hash karo
teamSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Login ke time password check
teamSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Leaderboard ke liye total time (seconds me), tab tak null jab tak team finish na kare
teamSchema.virtual("totalSeconds").get(function () {
  if (!this.startedAt || !this.finishedAt) return null;
  return Math.floor((this.finishedAt - this.startedAt) / 1000) + this.penaltySeconds;
});

teamSchema.set("toJSON", { virtuals: true });

// Leaderboard query fast rahe
teamSchema.index({ status: 1, finishedAt: 1 });

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;

