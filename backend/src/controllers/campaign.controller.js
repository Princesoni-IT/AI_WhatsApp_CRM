import Campaign from "../models/Campaign.model.js";
import Contact from "../models/Contact.model.js";
import ApiError from "../utils/ApiError.js";

const WAIT_MIN_MS = 5000;
const WAIT_MAX_MS = 15000;

const getMetaConfig = () => {
    const baseUrl = process.env.META_WHATSAPP_API_URL;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

    if (!baseUrl || !phoneNumberId || !accessToken) {
        throw new ApiError(
            500,
            "Meta WhatsApp configuration is missing. Please set META_WHATSAPP_API_URL, META_WHATSAPP_PHONE_NUMBER_ID and META_WHATSAPP_ACCESS_TOKEN."
        );
    }

    return { baseUrl, phoneNumberId, accessToken };
};

// Normalize phone number to international format (E.164)
const normalizePhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 91 for India
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    
    // If doesn't start with country code, add 91 for India
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned;
};

const sendMetaMessage = async (phoneNumber, text, imageUrl = null) => {
    const { baseUrl, phoneNumberId, accessToken } = getMetaConfig();
    const endpoint = `${baseUrl}/${phoneNumberId}/messages`;

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    console.log(`📞 Sending to: ${phoneNumber} → Normalized: ${normalizedPhone}`);

    let messageBody;

    if (imageUrl) {
        // Send image with caption
        messageBody = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizedPhone,
            type: "image",
            image: {
                link: imageUrl,
                caption: text,
            },
        };
    } else {
        // Send text only
        messageBody = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizedPhone,
            type: "text",
            text: {
                body: text,
            },
        };
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(messageBody),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
        const message = responseBody?.error?.message || "Meta WhatsApp API request failed";
        const errorCode = responseBody?.error?.code;
        const errorDetails = responseBody?.error?.error_data?.details;
        
        // More descriptive error message
        let fullError = message;
        if (errorCode) fullError += ` (Code: ${errorCode})`;
        if (errorDetails) fullError += ` - ${errorDetails}`;
        
        throw new Error(fullError);
    }

    return responseBody;
};

const getRandomDelay = () =>
    Math.floor(Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS + 1)) + WAIT_MIN_MS;

const sendCampaign = async (req, res) => {
    const { messageTemplate, recipientIds, imageUrl } = req.body;
    const shopkeeperId = req.user._id;

    const contacts = await Contact.find({
        _id: { $in: recipientIds },
        shopkeeper: shopkeeperId,
    });

    if (!contacts.length) {
        throw new ApiError(400, "No valid recipients found for this campaign.");
    }

    const campaign = await Campaign.create({
        shopkeeper: shopkeeperId,
        messageTemplate,
        imageUrl: imageUrl || null,
        recipients: contacts.map((contact) => contact._id),
        status: "queued",
    });

    const queuedMessages = contacts.map((contact) => ({
        contact,
        message: `${messageTemplate.replace(/\{User\}/gi, contact.name)} Reply STOP to unsubscribe.`,
    }));

    campaign.status = "sending";
    await campaign.save();

    const processQueue = async () => {
        for (const item of queuedMessages) {
            const delayMs = getRandomDelay();
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            try {
                await sendMetaMessage(item.contact.phoneNumber, item.message, imageUrl);
                campaign.sentCount += 1;
            } catch (error) {
                console.error(`Failed to send to ${item.contact.phoneNumber}:`, error.message);
                campaign.errors.push({
                    contact: item.contact._id,
                    message: error?.message || "Failed to send message",
                });
            }

            await campaign.save();
        }

        campaign.status = campaign.errors.length ? "failed" : "completed";
        await campaign.save();
    };

    void processQueue();

    return res.status(202).json({
        success: true,
        message: "Campaign queued for sending. Messages will be delivered with a delay to reduce ban risk.",
        data: {
            campaignId: campaign._id,
            recipients: contacts.length,
        },
    });
};

const getCampaigns = async (req, res) => {
    const campaigns = await Campaign.find({ shopkeeper: req.user._id })
        .populate("recipients", "name phoneNumber")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Campaign history retrieved successfully.",
        data: campaigns,
    });
};

const getCampaignById = async (req, res) => {
    const campaign = await Campaign.findOne({
        _id: req.params.id,
        shopkeeper: req.user._id,
    }).populate("recipients", "name phoneNumber");

    if (!campaign) {
        throw new ApiError(404, "Campaign not found.");
    }

    return res.status(200).json({
        success: true,
        message: "Campaign details retrieved successfully.",
        data: campaign,
    });
};

export { sendCampaign, getCampaigns, getCampaignById };
