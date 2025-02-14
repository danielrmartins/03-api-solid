import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";
import { MaxDistanceError } from "./errors/max-distance-error";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check-in Use Case", () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    await gymsRepository.create({
      id: "gym-01",
      title: "Javascript Gym",
      description: "The best gym for javascript developers",
      phone: "123456789",
      latitude: -30.0496352,
      longitude: -51.1689972,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check-in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -30.0496352,
      userLongitude: -51.1689972,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check-in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -30.0496352,
      userLongitude: -51.1689972,
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-01",
        userId: "user-01",
        userLatitude: -30.0496352,
        userLongitude: -51.1689972,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  it("should be able to check-in twice in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -30.0496352,
      userLongitude: -51.1689972,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -30.0496352,
      userLongitude: -51.1689972,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check-in in on a distant gym", async () => {
    gymsRepository.items.push({
      id: "gym-02",
      title: "Distant Gym",
      description: "The best gym for javascript developers",
      phone: "123456789",
      latitude: new Decimal(-10.5496352),
      longitude: new Decimal(-20.6689972),
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-02",
        userId: "user-id",
        userLatitude: -30.0496352,
        userLongitude: -51.1689972,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
