import Joi from "joi";

const purchaseReceiptIosSchema = Joi.object({
    platform: Joi.string().valid('ios').required(),
    receiptData: Joi.string().required(),
    isSandbox: Joi.boolean().optional().default(false),
});

const purchaseReceiptAndroidSchema = Joi.object({
    platform: Joi.string().valid('android').required(),
    productId: Joi.string().required(),
    googlePayToken: Joi.string().required(),
    subscription: Joi.boolean().optional().default(false),
});

export const purchaseReceiptSchema = Joi.object({
    platform: Joi.string().valid('ios', 'android').required(),
    imei: Joi.string().required()
})
    .when(Joi.object({ platform: Joi.valid('ios') }).unknown(), {
        then: purchaseReceiptIosSchema,
        otherwise: purchaseReceiptAndroidSchema,
    });

export const iapProductSchema = Joi.object({
    platform: Joi.string().valid('ios', 'android').required(),
})
