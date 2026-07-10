import Campaign from "../models/Campaign.model.js";
import Contact from "../models/Contact.model.js";
import ApiError from "../utils/ApiError.js";
import { sendTextMessage, sendImageMessage, getConnectionStatus } from "../services/whatsapp.service.js";

const WAIT_MIN_MS = 5000;
const WAIT_MAX_MS = 15000;

const sendWhatsAppMessage = async (phoneNumber, text, imageUrl = null) => {
    console.log(`📞 Sending to: ${phoneNumber}`);

    try {
        if (imageUrl) {
            // Send image with caption
            await sendImageMessage(phoneNumber, imageUrl, text);
        } else {
            // Send text only
            await sendTextMessage(phoneNumber, text);
        }
        return { success: true };
    } catch (error) {
        throw new Error(error.message || "Failed to send WhatsApp message");
    }
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
                await sendWhatsAppMessage(item.contact.phoneNumber, item.message, imageUrl);
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
