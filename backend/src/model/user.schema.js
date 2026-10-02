import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const memberSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true } },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, trim: true }, // unique index neeche (case-insensitive)
    teamCode: { type: String, required: true, unique: true, uppercase: true, trim: true }, // login ID
    password: { type: String, required: true, select: false },

    members: {
      type: [memberSchema],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 5,
        message: "Team me 2 se 5 members hone chahiye",
      },
    },

    activeSessionId: { type: String, default: null },

    // Game progress
    status: {
      type: String,
      enum: ["not_started", "playing", "finished"],
      default: "not_started",
    },
    currentLevel: { type: Number, default: 1, min: 1, max: 5 }, // 1-4 levels, 5 = khatam
    stage: { type: String, enum: ["question", "clue"], default: "question" },
    lockedUntil: { type: Date, default: null }, // galat answer par 10 min

    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    lastSolvedAt: { type: Date, default: null },

    levelSolvedAt: [{ _id: false, level: Number, at: Date }],
  },
  { timestamps: true }
);

teamSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

teamSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Finish hone ke baad total time (seconds). Lock ka time apne aap isme shamil hai.
teamSchema.virtual("totalSeconds").get(function () {
  if (!this.startedAt || !this.finishedAt) return null;
  return Math.floor((this.finishedAt - this.startedAt) / 1000);
});

teamSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.activeSessionId;
    return ret;
  },
});

// "Team A" aur "team a" ek hi maane jayenge
teamSchema.index(
  { teamName: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Leaderboard: finished teams time se, baaki level aur lastSolvedAt se
teamSchema.index({ status: 1, finishedAt: 1 });
teamSchema.index({ currentLevel: -1, lastSolvedAt: 1 });

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;