import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, min: 1, max: 4 },
    question: { type: String, required: true, trim: true },
    options: {
      type: [{ type: String, required: true, trim: true }],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 4,
        message: "Har question me 2 se 4 options chahiye",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v < this.options.length;
        },
        message: "correctIndex options ki range ke andar hona chahiye",
      },
    },
    clue: { type: String, required: true, trim: true }, // question sahi hone ke baad dikhega
    code: { type: String, required: true, trim: true, uppercase: true }, // jagah par chhupa code
    location: { type: String, trim: true }, // sirf volunteers/admin ke liye, client ko kabhi nahi bhejna
  },
  { _id: false }
);

const teamRouteSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
    levels: {
      type: [levelSchema],
      validate: {
        validator: (levels) => {
          const numbers = levels.map((l) => l.level).sort((a, b) => a - b);
          return (
            levels.length === 4 &&
            numbers.every((n, i) => n === i + 1) &&
            new Set(levels.map((l) => l.code)).size === 4
          );
        },
        message: "Exactly 4 levels (1-4) chahiye aur har level ka code alag hona chahiye",
      },
    },
  },
  { timestamps: true }
);

teamRouteSchema.methods.getLevel = function (n) {
  return this.levels.find((l) => l.level === n);
};

export default mongoose.models.TeamRoute || mongoose.model("TeamRoute", teamRouteSchema);