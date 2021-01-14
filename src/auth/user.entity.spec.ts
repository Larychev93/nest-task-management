import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User entity', () => {
  let user: User;
  const salt = 'testSalt';

  beforeEach(() => {
    user = new User();
    user.password = 'testPass';
    user.salt = salt;
    bcrypt.hash = jest.fn();
  })

  describe('validatePassword', () => {
    it('returns true if password is valid', async() => {
      bcrypt.hash.mockReturnValue('testPass')

      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('testPass')

      expect(bcrypt.hash).toHaveBeenCalledWith('testPass', salt);
      expect(result).toBeTruthy();
    })

    it('returns false if password is invalid', async() => {
      bcrypt.hash.mockReturnValue('wrong')

      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('wrong')

      expect(bcrypt.hash).toHaveBeenCalledWith('wrong', salt);
      expect(result).toBeFalsy();
    })
  })
})
