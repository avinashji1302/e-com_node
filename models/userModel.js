const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require('crypto')

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked:{
        type: Boolean,
        default : false
    },
    cart: {
      type: [],
      default: "",
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken:{
      type: String
    }
  },
  {
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpair: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")){
    next()
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatched = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// reset password
userSchema.methods.createPasswordResetToken= async function() {
  const resetToken= crypto.randomBytes(32).toString("hex");
  this.passwordResetToken= crypto.Hash("sha256").update(resetToken).digest('hex');
  this.passwordResetExpair= Date.now()+30*60*1000   
  return resetToken
}

//Export the model
module.exports = mongoose.model("users", userSchema);
