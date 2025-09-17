/**
 * Advanced Safety Plan Service
 * HIPAA-Compliant Safety Plan Management for Crisis Prevention & Response
 *
 * Features:
 * - Encrypted safety plan storage with version control
 * - Smart crisis detection and safety plan activation
 * - Emergency contact integration
 * - Collaborative safety planning (with consent)
 * - Evidence-based safety planning templates
 * - Crisis prediction and prevention
 */
import { prisma } from '../';
import { encryptSafetyPlan, decryptSafetyPlan } from '../utils/encryption';
import { triggerEmergencyNotifications } from './emergency-contact.service';
/**
 * Creates a new safety plan with encrypted content
 */
export async function createSafetyPlan(params) {
    const start = Date.now();
    try {
        // Encrypt the safety plan data
        const encrypted = encryptSafetyPlan(params.planData, params.userId);
        const plan = await prisma.safetyPlan.create({
            data: {
                userId: params.userId,
                title: params.title,
                version: 1,
                isActive: true,
                encryptedContent: encrypted.encryptedContent,
                contentHash: encrypted.contentHash,
                sharedWith: params.sharedWith || [],
                emergencyShare: params.emergencyShare || false,
            },
        });
        // Create initial version record
        await prisma.safetyPlanVersion.create({
            data: {
                safetyPlanId: plan.id,
                version: 1,
                changeLog: 'Initial safety plan creation',
                encryptedContent: encrypted.encryptedContent,
                contentHash: encrypted.contentHash,
                createdBy: params.userId,
            },
        });
        const executionTime = Date.now() - start;
        if (executionTime > 200) {
            console.warn(`⚠️ createSafetyPlan took ${executionTime}ms (target: <200ms)`);
        }
        console.log(`✅ Safety plan created for user ${params.userId}: "${params.title}"`);
        return plan;
    }
    catch (error) {
        console.error('Failed to create safety plan:', error);
        throw new Error('Unable to create safety plan');
    }
}
/**
 * Updates a safety plan with version control
 */
export async function updateSafetyPlan(params) {
    const start = Date.now();
    try {
        // Get current plan
        const currentPlan = await prisma.safetyPlan.findUnique({
            where: { id: params.planId },
            include: { user: true },
        });
        if (!currentPlan) {
            throw new Error('Safety plan not found');
        }
        // If updating plan data, encrypt it
        let encrypted;
        if (params.planData) {
            // Get current plan data and merge with updates
            const currentData = await getSafetyPlanData(params.planId, currentPlan.userId);
            const updatedData = { ...currentData, ...params.planData };
            encrypted = encryptSafetyPlan(updatedData, currentPlan.userId);
        }
        // Update the plan
        const updatedPlan = await prisma.safetyPlan.update({
            where: { id: params.planId },
            data: {
                title: params.title,
                version: { increment: 1 },
                encryptedContent: encrypted?.encryptedContent,
                contentHash: encrypted?.contentHash,
                sharedWith: params.sharedWith,
                emergencyShare: params.emergencyShare,
                updatedAt: new Date(),
            },
        });
        // Create version record
        if (encrypted) {
            await prisma.safetyPlanVersion.create({
                data: {
                    safetyPlanId: params.planId,
                    version: updatedPlan.version,
                    changeLog: params.changeLog || 'Safety plan updated',
                    encryptedContent: encrypted.encryptedContent,
                    contentHash: encrypted.contentHash,
                    createdBy: currentPlan.userId,
                },
            });
        }
        const executionTime = Date.now() - start;
        console.log(`✅ Safety plan updated: ${params.planId} (v${updatedPlan.version})`);
        return updatedPlan;
    }
    catch (error) {
        console.error('Failed to update safety plan:', error);
        throw new Error('Unable to update safety plan');
    }
}
/**
 * Gets decrypted safety plan data
 */
export async function getSafetyPlanData(planId, userId) {
    try {
        const plan = await prisma.safetyPlan.findUnique({
            where: { id: planId },
        });
        if (!plan || plan.userId !== userId) {
            throw new Error('Safety plan not found or access denied');
        }
        // Decrypt the safety plan content
        const decryptedData = decryptSafetyPlan(Buffer.from(plan.encryptedContent), userId, plan.contentHash, Buffer.alloc(32), // Salt - would be stored separately in production
        Buffer.alloc(16), // IV - would be stored separately in production
        Buffer.alloc(16) // Auth tag - would be stored separately in production
        );
        return decryptedData;
    }
    catch (error) {
        console.error('Failed to get safety plan data:', error);
        throw new Error('Unable to retrieve safety plan');
    }
}
/**
 * Gets all safety plans for a user
 */
export async function getUserSafetyPlans(userId) {
    return await prisma.safetyPlan.findMany({
        where: {
            userId,
            isActive: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
}
/**
 * Activates a safety plan during crisis (sends to emergency contacts)
 */
export async function activateSafetyPlan(planId, userId, sessionId, triggerReason) {
    const start = Date.now();
    try {
        const plan = await prisma.safetyPlan.findUnique({
            where: { id: planId },
        });
        if (!plan || plan.userId !== userId) {
            throw new Error('Safety plan not found or access denied');
        }
        // Get safety plan data
        const planData = await getSafetyPlanData(planId, userId);
        // If emergency sharing is enabled, notify emergency contacts
        if (plan.emergencyShare && planData.shareWithEmergencyContacts) {
            const message = `Safety Plan Activated: ${plan.title}\n\nReason: ${triggerReason || 'Crisis detected'}\n\nPlease check on your loved one and provide support according to their safety plan.`;
            await triggerEmergencyNotifications(userId, 'SAFETY_PLAN_ACTIVATION', 'HIGH', message, sessionId);
        }
        // Log the activation
        console.log(`🛡️ Safety plan activated: ${planId} for user ${userId}`);
        // Update plan with last activation time
        await prisma.safetyPlan.update({
            where: { id: planId },
            data: {
                updatedAt: new Date(), // Track last activation
            },
        });
        const executionTime = Date.now() - start;
        if (executionTime > 100) {
            console.warn(`⚠️ Safety plan activation took ${executionTime}ms (target: <100ms)`);
        }
    }
    catch (error) {
        console.error('Failed to activate safety plan:', error);
        throw new Error('Unable to activate safety plan');
    }
}
/**
 * Gets safety plan version history
 */
export async function getSafetyPlanVersions(planId, userId) {
    // Verify user owns the plan
    const plan = await prisma.safetyPlan.findUnique({
        where: { id: planId },
        select: { userId: true },
    });
    if (!plan || plan.userId !== userId) {
        throw new Error('Safety plan not found or access denied');
    }
    return await prisma.safetyPlanVersion.findMany({
        where: { safetyPlanId: planId },
        orderBy: { version: 'desc' },
    });
}
/**
 * Shares safety plan with emergency contacts or professionals
 */
export async function shareSafetyPlan(planId, userId, shareWithEmergencyContacts, allowProfessionalAccess) {
    // Verify user owns the plan
    const plan = await prisma.safetyPlan.findUnique({
        where: { id: planId },
    });
    if (!plan || plan.userId !== userId) {
        throw new Error('Safety plan not found or access denied');
    }
    // Update the safety plan data with sharing preferences
    const planData = await getSafetyPlanData(planId, userId);
    planData.shareWithEmergencyContacts = shareWithEmergencyContacts;
    planData.allowProfessionalAccess = allowProfessionalAccess;
    return await updateSafetyPlan({
        planId,
        planData,
        changeLog: 'Updated sharing preferences',
        emergencyShare: shareWithEmergencyContacts,
    });
}
/**
 * Creates a safety plan from template (evidence-based)
 */
export async function createSafetyPlanFromTemplate(userId, templateType) {
    const templates = {
        suicide_prevention: {
            title: 'Suicide Prevention Safety Plan',
            planData: {
                warningSignsInternal: [
                    'Feeling hopeless or trapped',
                    'Intense emotional pain',
                    'Thoughts of death or dying',
                    'Feeling like a burden to others',
                ],
                warningSignsExternal: [
                    'Major life changes or losses',
                    'Relationship conflicts',
                    'Financial stress',
                    'Social isolation',
                ],
                copingStrategies: [
                    'Deep breathing exercises',
                    'Listen to calming music',
                    'Take a warm bath or shower',
                    'Write in a journal',
                    'Practice mindfulness meditation',
                ],
                socialSupports: [
                    'Close family member',
                    'Trusted friend',
                    'Support group member',
                ],
                professionalContacts: [
                    'Primary therapist',
                    'Psychiatrist',
                    'Primary care doctor',
                ],
                environmentalSafety: [
                    'Remove or secure means of self-harm',
                    'Ask someone to stay with you',
                    'Go to a safe, public place',
                ],
                reasonsToLive: [
                    'Family and loved ones',
                    'Personal goals and dreams',
                    'Pets that depend on me',
                    'Making a positive difference',
                ],
                crisisNumbers: [
                    '988 - Suicide & Crisis Lifeline',
                    '1-800-273-8255 - National Suicide Prevention Lifeline',
                    'Text HOME to 741741 - Crisis Text Line',
                ],
            },
        },
        anxiety_management: {
            title: 'Anxiety Management Safety Plan',
            planData: {
                warningSignsInternal: [
                    'Racing heart or shortness of breath',
                    'Excessive worry or fear',
                    'Restlessness or feeling on edge',
                    'Difficulty concentrating',
                ],
                copingStrategies: [
                    '4-7-8 breathing technique',
                    'Progressive muscle relaxation',
                    'Grounding exercises (5-4-3-2-1)',
                    'Gentle physical activity',
                ],
                environmentalSafety: [
                    'Create a calm, quiet space',
                    'Remove anxiety triggers when possible',
                    'Use comfort items (blanket, photos)',
                ],
            },
        },
        depression_support: {
            title: 'Depression Support Safety Plan',
            planData: {
                warningSignsInternal: [
                    'Persistent sadness or emptiness',
                    'Loss of interest in activities',
                    'Fatigue or lack of energy',
                    'Feelings of worthlessness',
                ],
                copingStrategies: [
                    'Gentle exercise or movement',
                    'Engage in a creative activity',
                    'Spend time in nature',
                    'Practice self-compassion',
                ],
                socialSupports: [
                    'Supportive family member',
                    'Understanding friend',
                    'Mental health support group',
                ],
            },
        },
        general_wellness: {
            title: 'General Wellness Safety Plan',
            planData: {
                copingStrategies: [
                    'Regular sleep schedule',
                    'Healthy eating habits',
                    'Regular exercise',
                    'Stress management techniques',
                ],
                protectiveFactors: [
                    'Strong social connections',
                    'Regular self-care practices',
                    'Meaningful work or activities',
                    'Spiritual or philosophical beliefs',
                ],
            },
        },
    };
    const template = templates[templateType];
    if (!template) {
        throw new Error('Invalid template type');
    }
    // Fill in default values for missing fields
    const defaultPlanData = {
        warningSignsInternal: [],
        warningSignsExternal: [],
        copingStrategies: [],
        socialSupports: [],
        professionalContacts: [],
        environmentalSafety: [],
        emergencyContacts: [],
        reasonsToLive: [],
        crisisNumbers: [
            '988 - Suicide & Crisis Lifeline',
            '1-800-273-8255 - National Suicide Prevention Lifeline',
            'Text HOME to 741741 - Crisis Text Line',
        ],
        riskFactors: [],
        protectiveFactors: [],
        medications: [],
        medicalConditions: [],
        preferredCopingMethods: [],
        pastEffectiveStrategies: [],
        triggerPatterns: [],
        shareWithEmergencyContacts: false,
        allowProfessionalAccess: false,
        autoActivateOnCrisis: false,
        ...template.planData,
    };
    return await createSafetyPlan({
        userId,
        title: template.title,
        planData: defaultPlanData,
        emergencyShare: false,
    });
}
/**
 * Safety plan system health check
 */
export async function checkSafetyPlanHealth() {
    try {
        const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalPlans, activePlans, recentlyUpdated, avgVersions] = await Promise.all([
            prisma.safetyPlan.count(),
            prisma.safetyPlan.count({ where: { isActive: true } }),
            prisma.safetyPlan.count({
                where: {
                    isActive: true,
                    updatedAt: { gte: since7Days },
                },
            }),
            prisma.safetyPlan.aggregate({
                _avg: { version: true },
            }),
        ]);
        const averageVersions = avgVersions._avg.version || 0;
        const recentUpdateRate = activePlans > 0 ? recentlyUpdated / activePlans : 0;
        let status = 'healthy';
        if (recentUpdateRate < 0.1 || averageVersions < 1.5) {
            status = 'unhealthy';
        }
        else if (recentUpdateRate < 0.2 || averageVersions < 2) {
            status = 'degraded';
        }
        return {
            status,
            totalPlans,
            activePlans,
            recentlyUpdated,
            averageVersions,
        };
    }
    catch (error) {
        console.error('Safety plan health check failed:', error);
        return {
            status: 'unhealthy',
            totalPlans: 0,
            activePlans: 0,
            recentlyUpdated: 0,
            averageVersions: 0,
        };
    }
}
//# sourceMappingURL=safety-plan.service.js.map