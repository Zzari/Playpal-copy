// passport.test.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

describe('Google OAuth strategy DLSU email validation', () => {

  const createStrategy = () => {
    return new GoogleStrategy(
      {
        clientID: 'fake-client-id',
        clientSecret: 'fake-client-secret',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true
      },
      function (req, accessToken, refreshToken, profile, done) {
        const email = profile.emails?.[0]?.value || '';

        if (!email.toLowerCase().endsWith('@dlsu.edu.ph')) {
          return done(null, false, { message: 'Only DLSU emails are allowed.' });
        }

        return done(null, profile);
      }
    );
  };

  it('✅ accepts user with a DLSU email', (done) => {
    const profile = {
      id: '12345',
      displayName: 'John Dlsu',
      emails: [{ value: 'student@dlsu.edu.ph' }],
    };

    const strategy = createStrategy();

    strategy._verify({}, null, null, profile, (err, user, info) => {
      try {
        expect(err).toBeNull();
        expect(user).toBe(profile);
        expect(info).toBeUndefined();
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('❌ rejects user with a non-DLSU email', (done) => {
    const profile = {
      id: '67890',
      displayName: 'Jane Gmail',
      emails: [{ value: 'user@gmail.com' }],
    };

    const strategy = createStrategy();

    strategy._verify({}, null, null, profile, (err, user, info) => {
      try {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info).toEqual({ message: 'Only DLSU emails are allowed.' });
        done();
      } catch (error) {
        done(error);
      }
    });
  });

});
