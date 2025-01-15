import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(private usersRepository: any) {}

  async execute({ name, email, password }: RegisterUseCaseRequest) {
    const password_hash = await hash(password, 6);

    const useWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (useWithSameEmail) {
      throw new Error("User with same email already exists");
    }

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    });
  }
}
