import dotenv from 'dotenv';
dotenv.config();

import { OIDCStrategy } from 'passport-azure-ad';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js'; // Adjust the path as per your project structure

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
(token, tokenSecret, profile, done) => {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return done(err, user);
    });
}
));

passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUrl: process.env.MICROSOFT_CALLBACK_URL,
    responseType: 'code',
    responseMode: 'query',
    scope: ['profile', 'offline_access', 'user.read']
},
(iss, sub, profile, accessToken, refreshToken, done) => {
    User.findOrCreate({ microsoftId: profile.oid }, (err, user) => {
        return done(err, user);
    });
}
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
