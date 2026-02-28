const passport = require('passport');
const auth_strategy = require('passport-google-oauth20').Strategy;
const player = require('../models/users');

passport.use(
    new auth_strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV == "development" ? 'http://localhost:8080/auth/google/callback' : process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
        passReqToCallback: true
    },
    async function(req, accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails[0].value;
            const emailDomain = email.split('@')[1];

            if (emailDomain !== 'dlsu.edu.ph') {
                return done(null, false);
            }

            let user = await player.findOne({email: profile.emails[0].value})
            if (!user) {
                // same logic as addPlayer with fullName
                const givenName = profile.name?.givenName ?? '';
                const familyName = profile.name?.familyName ?? '';
                const fullName = `${profile.name.givenName} ${profile.name.familyName}`;
                const pfp = profile.photos?.[0]?.value ?? '';
                user = await player.create({ 
                    email: email, 
                    fullName:fullName, 
                    givenName: givenName, 
                    familyName: familyName, 
                    pfp: pfp,
                    bio: 'Insert your bio here',
                    favSports: ['']});
            }
            console.log("Passport user", user);
            done(null, user);
        } catch (error) {
            done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    console.log("Serialize User", user);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try{
        const user = await player.findById(id);
        console.log("Deserialize User", user);
        if (!user) {
            console.log("User not found for ID:", id);
        }
        done(null, user);
    }catch (err) {
        console.log("Error in deserializeUser:", err);
        done(err);
    }
});

module.exports = passport;