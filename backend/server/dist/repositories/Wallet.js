import mongoose, { Schema } from "mongoose";
const walletSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        immutable: true,
        index: true,
    },
    availableBalance: {
        type: Number,
        default: 0,
        min: 0,
    },
    pendingBalance: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalWithdrawn: {
        type: Number,
        default: 0,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
/* Indexes */
walletSchema.index({
    ownerId: 1,
});
/* Model */
const Wallet = mongoose.models.Wallet ||
    mongoose.model("Wallet", walletSchema);
export default Wallet;
//# sourceMappingURL=Wallet.js.map