import mongoose from "mongoose";

const ProcessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Virtual for daysPassed (computed)
ProcessSchema.virtual("daysPassed").get(function () {
  const now = new Date();
  const diff = now.getTime() - this.startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.models.Process || mongoose.model("Process", ProcessSchema);

