import { Test } from '@nestjs/testing';
import { DUPLICATE_ERROR_CODE, UserRepository } from './user.repository';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

const mockAuthCredentialsDto = { username: 'TestUserName', password: 'TestPass' }

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [UserRepository]
    }).compile()

    userRepository = await module.get<UserRepository>(UserRepository);
  })

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockAuthCredentialsDto)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      userRepository.create.mockRejectedValue({ code: DUPLICATE_ERROR_CODE });

      await expect(userRepository.signUp(mockAuthCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an error if create fails', async () => {
      userRepository.create.mockRejectedValue({ code: 'no existing code' });

      await expect(userRepository.signUp(mockAuthCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'Tester'
      user.validatePassword = jest.fn();
    })

    it('returns username if valid', async() => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true)

      const result = await userRepository.validateUserPassword(mockAuthCredentialsDto)

      expect(result).toEqual(user.username)
    })

    it('returns null if user not found', async() => {
      userRepository.findOne.mockResolvedValue(null);
      user.validatePassword.mockResolvedValue(true)

      const result = await userRepository.validateUserPassword(mockAuthCredentialsDto)

      expect(result).toBeNull();
    })

    it('returns null if user password is not valid', async() => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false)

      const result = await userRepository.validateUserPassword(mockAuthCredentialsDto)

      expect(result).toBeNull();
    })
  })

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async() => {
      const expectedResult = 'testHash';

      bcrypt.hash = jest.fn().mockResolvedValue(expectedResult)
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await userRepository.hashPassword('testPassword', 'testSalt');

      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual(expectedResult);
    })
  })
})
