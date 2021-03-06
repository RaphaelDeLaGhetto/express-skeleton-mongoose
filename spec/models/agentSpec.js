'use strict';

describe('Agent', function() {
  var db = require('../../models');
  var Agent = db.Agent;

  var agent;

  describe('basic validation', function() {
    beforeEach(function(done) {
      agent = new Agent({ email: 'someguy@example.com', password: 'secret' });
      done();
    });

    afterEach(function(done) {
      db.mongoose.connection.db.dropDatabase().then(function(err, result) {
        done();
      }).catch(function(err) {
        done.fail(err);         
      });
    });
  
    it('sets the createdAt and updatedAt fields', function(done) {
      expect(agent.createdAt).toBe(undefined);
      expect(agent.updatedAt).toBe(undefined);
      agent.save().then(function(obj) {
        expect(agent.createdAt instanceof Date).toBe(true);
        expect(agent.updatedAt instanceof Date).toBe(true);
        done();
      }).catch(function(error) {
        done.fail(error);
      });
    });
  
    it("encrypts the agent's password", function(done) {
      expect(agent.password).toEqual('secret');
      agent.save().then(function(obj) {
        expect(agent.password).not.toEqual('secret');
        done();
      }).catch(function(error) {
        done.fail(error);
      });
    });

    it('does not allow two identical emails', function(done) {
      agent.save().then(function(obj) {
        Agent.create({ email: 'someguy@example.com', password: 'secret' }).then(function(obj) {
          done.fail('This should not have saved');
        }).catch(function(error) {
          expect(Object.keys(error.errors).length).toEqual(1);
          expect(error.errors['email'].message).toEqual('That email is taken');
          done();
        });
      }).catch(function(error) {
        done.fail(error);
      });
    });

    it('does not allow an empty email field', function(done) {
      Agent.create({ email: ' ', password: 'secret' }).then(function(obj) {
        done.fail('This should not have saved');
      }).catch(function(error) {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['email'].message).toEqual('No email supplied');
        done();
      });
    });

    it('does not allow an undefined email field', function(done) {
      Agent.create({ password: 'secret' }).then(function(obj) {
        done.fail('This should not have saved');
      }).catch(function(error) {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['email'].message).toEqual('No email supplied');
        done();
      });
    });

    it('does not allow an empty password field', function(done) {
      Agent.create({ email: 'someguy@example.com', password: '   ' }).then(function(obj) {
        done.fail('This should not have saved');
      }).catch(function(error) {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['password'].message).toEqual('No password supplied');
        done();
      });
    });

    it('does not allow an undefined password field', function(done) {
      Agent.create({ email: 'someguy@example.com' }).then(function(obj) {
        done.fail('This should not have saved');
      }).catch(function(error) {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['password'].message).toEqual('No password supplied');
        done();
      });
    });

    it('does not re-hash a password on update', function(done) {
      agent.save().then(function(obj) {
        var passwordHash = agent.password;
        agent.email = 'newemail@example.com';
        agent.save().then(function(obj) {
          expect(agent.password).toEqual(passwordHash); 
          done();
        });
      });
    });

    /**
     * .validPassword
     */
    describe('.validPassword', function() {
      beforeEach(function(done) {
        agent.save().then(function(obj) {
          done();
        });
      });

      it('returns true if the password is a match', function(done) {
        Agent.validPassword('secret', agent.password, function(err, res) {
          expect(res).toEqual(agent);
          done();
        }, agent);
      });

      it('returns false if the password is not a match', function(done) {
        Agent.validPassword('wrongsecretpassword', agent.password, function(err, res) {
          expect(res).toBe(false);
          done();
        }, agent);
      });
    });
  });
});
