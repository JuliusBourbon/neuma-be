import { onboardingRepository } from "../repositories/onboarding.repository.js";
import { OnboardingInput } from "../validators/auth.validator.js";

export const onboardingService = {
    submit: async (userId: string, data: OnboardingInput) => {
        return onboardingRepository.upsert(userId, data);
    },

    get: async (userId: string) => {
        return onboardingRepository.findByUserId(userId);
    },
};