import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { CreateGymUseCase } from "./create-gym";

let gymsRepository: InMemoryGymsRepository;
let sut: CreateGymUseCase;

describe("Create Gym Use Case", async () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new CreateGymUseCase(gymsRepository);
  });

  it("should create a gym", async () => {
    const { gym } = await sut.execute({
      title: "Gym 1",
      description: "Description",
      phone: "123456789",
      latitude: 1.0,
      longitude: 1.0,
    });

    expect(gym.id).toEqual(expect.any(String));
  });
});
