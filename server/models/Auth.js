

const bcrypt = require("bcryptjs");
const { model, Schema } = require("mongoose");


const authSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
      minlength: [5, "Username must be of minimum 6 characters"],
      maxlength: [20, "Username must be of  maximum 20 characters"],
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    phoneNumber: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    private: {
      type: Boolean,
      default: true
    },
    profile_photo: {
      type: String,
      required: true
    },
    refreshToken: [String],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);


authSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);

    this.password = hashed;
  }
  next();
});


authSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


authSchema.statics.isUserNameExist = async function (userName, excludeAuthId) {
  const auth = await this.findOne({ userName, _id: { $ne: excludeAuthId } });
  return !!auth;
};


authSchema.statics.countAccountsByPhoneNumber = async function (phoneNumber) {
  return await this.countDocuments({ phoneNumber });
};


authSchema.statics.findAccountsByPhoneNumber = function(phoneNumber) {
  return this.find({ phoneNumber });
};

module.exports = model("auth", authSchema);