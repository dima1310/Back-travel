import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default: '',
    },
    bio: { type: String, required: false, default: '' },
    onboardingCompleted: { type: Boolean, default: false },
    savedStories: [{ type: Schema.Types.ObjectId, ref: 'stories' }],
    settings: {
      darkMode: { type: Boolean, default: false },
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserCollection = model('user', userSchema);
