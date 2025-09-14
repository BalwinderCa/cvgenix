const User = require('../../models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password); // Not hashed yet
      expect(savedUser.role).toBe('user');
      expect(savedUser.credits).toBe(3);
      expect(savedUser.isActive).toBe(true);
    });

    it('should require firstName', async () => {
      const userData = {
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastName', async () => {
      const userData = {
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123', // Too short
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Virtuals', () => {
    it('should return full name', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('User JSON Serialization', () => {
    it('should exclude password from JSON output', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.fullName).toBe('John Doe');
    });
  });

  describe('User Defaults', () => {
    it('should set default values', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('user');
      expect(user.credits).toBe(3);
      expect(user.isActive).toBe(true);
      expect(user.preferences.emailNotifications).toBe(true);
      expect(user.preferences.marketingEmails).toBe(false);
      expect(user.preferences.theme).toBe('light');
      expect(user.preferences.language).toBe('en');
      expect(user.preferences.timezone).toBe('UTC');
    });
  });
});
