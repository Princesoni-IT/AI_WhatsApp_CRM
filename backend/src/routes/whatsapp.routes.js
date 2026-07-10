import { Router } from "express";
import { getConnectionStatus, generateNewQR, logout, getChats, getChatMessages, sendMessageToChat, markChatAsRead, syncContactsAsChats } from "../services/whatsapp.service.js";
import verifyJWT from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = Router();

// Get WhatsApp connection status and QR code
router.get(
    "/status",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const status = getConnectionStatus();
        
        return res.status(200).json({
            success: true,
            message: "WhatsApp connection status retrieved",
            data: status,
        });
    })
);

// Generate new QR code
router.post(
    "/generate-qr",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const result = await generateNewQR();
        
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    })
);

// Logout from WhatsApp
router.post(
    "/logout",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const result = await logout();
        
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    })
);

// Get all chats (inbox)
router.get(
    "/chats",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const chats = await getChats();
        
        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats,
        });
    })
);

// Get messages for a specific chat
router.get(
    "/chats/:chatId/messages",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const messages = await getChatMessages(decodeURIComponent(chatId));
        
        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages,
        });
    })
);

// Send message to a chat
router.post(
    "/chats/:chatId/messages",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const { text } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required",
            });
        }
        
        const result = await sendMessageToChat(decodeURIComponent(chatId), text);
        
        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: result,
        });
    })
);

// Mark chat as read
router.post(
    "/chats/:chatId/read",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const result = await markChatAsRead(decodeURIComponent(chatId));
        
        return res.status(200).json({
            success: true,
            message: "Chat marked as read",
            data: result,
        });
    })
);

// Sync contacts as chats (for testing/demo)
router.post(
    "/sync-contacts",
    verifyJWT,
    asyncHandler(async (req, res) => {
        const result = await syncContactsAsChats();
        
        return res.status(200).json({
            success: true,
            message: `Synced ${result.count} contacts as chats`,
            data: result,
        });
    })
);

export default router;
