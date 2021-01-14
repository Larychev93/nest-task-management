import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn()
});

describe('jwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository }
      ]
    }).compile()

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository)
  })

  describe('validate', () => {
    it('it validates and returns a user based on JWT payload', async() => {
      const desiredUser = {
        username: 'Tester'
      }

      userRepository.findOne.mockResolvedValue(desiredUser);
      expect(userRepository.findOne).not.toHaveBeenCalled()

      const result = await jwtStrategy.validate({ username: desiredUser.username })

      expect(userRepository.findOne).toHaveBeenCalledWith({ username: desiredUser.username });
      expect(result).toEqual(desiredUser);
    })

    it('throws unauthorized error is user not found', async() => {
      userRepository.findOne.mockResolvedValue(null)

      const action = async () => {
        await jwtStrategy.validate({ username: 'not exist user' })
      };

      await expect(action()).rejects.toThrow(UnauthorizedException);
    })
  })
})
