import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    name: String,
    email: String
});

userSchema.statics.findOrCreate = function findOrCreate(profile, cb) {
    const userObj = new this();
    this.findOne({ googleId: profile.id }, function (err, result) {
        if (!result) {
            userObj.googleId = profile.id;
            userObj.name = profile.displayName;
            userObj.email = profile.emails[0].value;
            userObj.save(cb);
        } else {
            cb(err, result);
        }
    });
};

const User = mongoose.model('User', userSchema);

export default User;
